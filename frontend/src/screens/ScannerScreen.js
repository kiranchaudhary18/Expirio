import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import { api } from '../services/api';

const ScannerScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = createStyles(theme, isDarkMode);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasPermission = permission?.granted;
  const permissionLoading = !permission;

  const requestCameraPermission = async () => {
    await requestPermission();
  };

  /**
   * Fetch book details from Google Books API using ISBN
   */
  const fetchBookDetails = async (isbn) => {
    try {
      console.log('📚 Searching Google Books API for ISBN:', isbn);
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`,
        { timeout: 5000 }
      );

      if (response.data.items && response.data.items.length > 0) {
        const book = response.data.items[0].volumeInfo;
        console.log('✅ Book found in Google Books API');
        return {
          title: book.title || 'Unknown Book',
          imageUrl: book.imageLinks?.thumbnail || null,
          author: book.authors ? book.authors.join(', ') : null,
          publisher: book.publisher || null,
        };
      }
      console.log('⚠️  ISBN not found in Google Books API');
      return null;
    } catch (error) {
      console.log('⚠️  Google Books API error:', error.message);
      return null;
    }
  };

  /**
   * Step 1: Try external APIs
   * Step 2: If not found, check MongoDB Products collection  
   * Step 3: If still not found, allow manual entry with barcode pre-filled
   */
  const fetchProductDetails = async (barcode, scanType = 'barcode') => {
    try {
      setLoading(true);
      Vibration.vibrate(100);
      setScanned(true);
      setScannedData({ type: scanType, data: barcode });

      // Special handling for QR codes - navigate immediately without checking APIs
      if (scanType === 'qr') {
        console.log('🔍 Step 1: QR Code detected - navigating directly');
        setLoading(false);
        navigation.navigate('AddItem', {
          barcode: barcode,
          itemName: '',
          itemImage: null,
          category: 'QR Product',
          fromBarcode: true,
          scanType: 'qr',
          source: 'qr_scan'
        });
        setScanned(false);
        return;
      }

      let product = null;
      let source = null;

      // ========== STEP 1: Try External APIs ==========
      console.log('🔍 STEP 1: Checking external APIs...');

      // Check if it's a 13-digit ISBN
      if (barcode.length === 13 && /^\d+$/.test(barcode)) {
        console.log('📚 ISBN-13 detected, checking Google Books API...');
        const bookData = await fetchBookDetails(barcode);
        if (bookData) {
          product = {
            product_name: bookData.title,
            image_url: bookData.imageUrl,
            categories: 'Books, Educational, ISBN Book',
          };
          source = 'api';
          console.log('✅ Book found in Google Books API');
        }
      }

      // If not found in Google Books, try OpenFoodFacts
      if (!product) {
        try {
          console.log('🍔 Trying OpenFoodFacts API...');
          const response1 = await axios.get(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
            { timeout: 5000 }
          );

          if (response1.data.status === 1 && response1.data.product) {
            product = response1.data.product;
            source = 'openfoodfacts';
            console.log('✅ Product found in OpenFoodFacts');
            console.log('📦 Product Details:', {
              name: product.product_name,
              brand: product.brands,
              categories: product.categories,
              image: product.image_url
            });
          }
        } catch (error) {
          console.log('⚠️  OpenFoodFacts API failed:', error.message);
        }
      }

      // If not found, try OpenBeautyFacts
      if (!product) {
        try {
          console.log('💄 Trying OpenBeautyFacts API...');
          const response2 = await axios.get(
            `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`,
            { timeout: 5000 }
          );

          if (response2.data.status === 1 && response2.data.product) {
            product = response2.data.product;
            source = 'openbeautyfacts';
            console.log('✅ Product found in OpenBeautyFacts');
            console.log('💄 Product Details:', {
              name: product.product_name,
              brand: product.brands,
              categories: product.categories,
              image: product.image_url
            });
          }
        } catch (error) {
          console.log('⚠️  OpenBeautyFacts API failed:', error.message);
        }
      }

      // If not found, try BarcodeLookup
      if (!product) {
        try {
          console.log('🏪 Trying BarcodeLookup API...');
          const API_KEY = 'YOUR_API_KEY'; // Replace with your API key
          const response3 = await axios.get(
            `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=${API_KEY}`,
            { timeout: 5000 }
          );

          if (response3.data.products && response3.data.products.length > 0) {
            product = response3.data.products[0];
            source = 'api';
            console.log('✅ Product found in BarcodeLookup');
          }
        } catch (error) {
          console.log('⚠️  BarcodeLookup API failed');
        }
      }

      // If found in external API, navigate with product details
      // If found in external API, navigate with product details
      if (product && (source === 'openfoodfacts' || source === 'openbeautyfacts' || source === 'barcodelookup' || source === 'api')) {
        console.log('✅ STEP 1 SUCCESS: Product found in external API');
        const mapping = mapProductCategory(product, source);
        console.log('🎯 Mapped Details:', mapping);
        setLoading(false);
        navigation.navigate('AddItem', {
          itemName: mapping.productName,
          itemImage: mapping.imageUrl,
          category: mapping.category,
          barcode: barcode,
          fromBarcode: true,
          scanType: scanType,
          source: source,
          productBrand: product.brands || '',
          productCategories: product.categories || ''
        });
        setScanned(false);
        return;
      }

      // ========== STEP 2: Check MongoDB Products Collection ==========
      console.log('🔍 STEP 2: External APIs not found. Checking general products database...');
      try {
        const response = await axios.get(
          `${api.defaults.baseURL}/products/barcode/${barcode}`
        );

        if (response.data.success && response.data.data) {
          const dbProduct = response.data.data;
          console.log('✅ STEP 2 SUCCESS: Product found in database');
          setLoading(false);
          navigation.navigate('AddItem', {
            itemName: dbProduct.itemName,
            itemImage: dbProduct.itemImage,
            category: dbProduct.category,
            barcode: barcode,
            fromBarcode: true,
            scanType: scanType,
            source: 'database'
          });
          setScanned(false);
          return;
        }
      } catch (error) {
        console.log('⚠️  Product not found in database');
      }

      // ========== STEP 3: Allow Manual Entry ==========
      console.log('🔍 STEP 3: Not found anywhere. Allow manual entry with barcode.');
      setLoading(false);
      setScanned(false);

      Alert.alert(
        'Product Not Found',
        'This product was not found in any database. You can still add it by entering the details manually.',
        [
          {
            text: 'Add Manually',
            onPress: () => {
              navigation.navigate('AddItem', {
                barcode: barcode,
                itemName: '',
                itemImage: null,
                category: '',
                fromBarcode: true,
                scanType: scanType,
                source: 'manual'
              });
            },
          },
          {
            text: 'Cancel',
            onPress: () => {
              setScanned(false);
            },
            style: 'cancel'
          }
        ]
      );

    } catch (error) {
      setLoading(false);
      setScanned(false);
      console.error('❌ Error in product fetch flow:', error);

      Alert.alert(
        'Error',
        'An error occurred while processing the barcode. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    }
  };

  /**
   * Helper function to map API product data to app categories
   */
  const mapProductCategory = (product, source) => {
    let productName = '';
    let imageUrl = null;
    let categoryText = '';

    if (source === 'openfoodfacts' || source === 'openbeautyfacts') {
      productName = product.product_name || 'Unknown Product';
      imageUrl = product.image_url || null;
      categoryText = product.categories || '';
    } else if (source === 'barcodelookup') {
      productName = product.title || 'Unknown Product';
      imageUrl = product.images && product.images.length > 0 ? product.images[0] : null;
      categoryText = product.category || '';
    } else if (source === 'api') {
      // Generic API source fallback
      productName = product.product_name || product.title || 'Unknown Product';
      imageUrl = product.image_url || (product.images && product.images.length > 0 ? product.images[0] : null);
      categoryText = product.categories || product.category || '';
    } else if (source === 'googlebooks') {
      productName = product.product_name || 'Unknown Book';
      imageUrl = product.image_url || null;
      categoryText = product.categories || 'Books';
    }

    // Map to app categories
    let category = 'Other';
    const categoryLower = categoryText.toLowerCase();

    if (
      categoryLower.includes('book') ||
      categoryLower.includes('isbn') ||
      categoryLower.includes('education') ||
      categoryLower.includes('ncert')
    ) {
      category = 'Books';
    } else if (
      categoryLower.includes('medicine') ||
      categoryLower.includes('drug') ||
      categoryLower.includes('pharmaceutical') ||
      categoryLower.includes('tablet') ||
      categoryLower.includes('capsule')
    ) {
      category = 'Medicine';
    } else if (
      categoryLower.includes('cosmetic') ||
      categoryLower.includes('beauty') ||
      categoryLower.includes('personal care') ||
      categoryLower.includes('skincare')
    ) {
      category = 'Cosmetics';
    } else if (
      categoryLower.includes('food') ||
      categoryLower.includes('snacks') ||
      categoryLower.includes('beverage') ||
      categoryLower.includes('grocery')
    ) {
      category = 'Food';
    }

    return {
      productName,
      imageUrl,
      category
    };
  };

  const handleBarCodeScanned = (result) => {
    if (scanned || loading) return;
    
    const { data, type } = result;
    
    // Detect scan type
    let scanType = 'barcode'; // default
    
    // Check if it's a QR code
    if (type === 'qr') {
      scanType = 'qr';
    }
    // Check if it's a 13-digit ISBN
    else if (data.length === 13 && /^\d+$/.test(data)) {
      scanType = 'isbn';
    }
    // Otherwise it's a regular barcode (EAN-13, UPC, etc.)
    else {
      scanType = 'barcode';
    }
    
    console.log(`Scan detected - Type: ${scanType}, Data: ${data}`);
    fetchProductDetails(data, scanType);
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Permission not determined yet
  if (permissionLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="scan-outline" size={64} color={theme.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="camera-off-outline" size={64} color={theme.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            To scan barcodes and expiry dates, please enable camera access in your device settings.
          </Text>
          <CustomButton
            title="Open Settings"
            onPress={handleOpenSettings}
            icon="settings-outline"
            style={styles.settingsButton}
          />
          <CustomButton
            title="Try Again"
            onPress={requestCameraPermission}
            variant="outline"
            icon="refresh"
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',      // ISBN-13 (books), EAN-13 standard
            'ean8',       // ISBN-8, EAN-8 standard
            'upc_a',      // UPC-A (US products)
            'upc_e',      // UPC-E (compact US products)
            'qr',         // QR codes (universal)
            'code128',    // Code 128 (complex data)
            'code39',     // Code 39 (alphanumeric)
            'itf14',      // ITF-14 (logistics)
            'pdf417',     // PDF417 (documents)
            'datamatrix', // Data Matrix (manufacturing)
            'aztec',      // Aztec codes
          ],
        }}
        style={StyleSheet.absoluteFillObject}
        enableTorch={flashOn}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color={theme.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Barcode</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setFlashOn(!flashOn)}
            >
              <Ionicons
                name={flashOn ? 'flash' : 'flash-off'}
                size={24}
                color={theme.white}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Scanner Frame */}
        <View style={styles.scannerFrame}>
          <View style={styles.scannerCorner} />
          <View style={[styles.scannerCorner, styles.topRight]} />
          <View style={[styles.scannerCorner, styles.bottomLeft]} />
          <View style={[styles.scannerCorner, styles.bottomRight]} />
          
          {/* Scan Line Animation */}
          <View style={styles.scanLine} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>
            Position the barcode within the frame
          </Text>
          <Text style={styles.subInstructionsText}>
            Scanning will happen automatically
          </Text>
        </View>

        {/* Bottom Actions */}
        <SafeAreaView edges={['bottom']} style={styles.bottomContainer}>
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="create-outline" size={24} color={theme.white} />
              </View>
              <Text style={styles.actionText}>Manual Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton}>
              <View style={styles.captureButtonInner}>
                <Ionicons name="scan" size={32} color={theme.white} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Coming Soon',
                  'OCR scanning for expiry dates will be available in a future update!'
                );
              }}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="text-outline" size={24} color={theme.white} />
              </View>
              <Text style={styles.actionText}>Scan Text</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Fetching product details...</Text>
          </View>
        </View>
      )}

      {/* Scanned indicator */}
      {scanned && !loading && (
        <View style={styles.scannedOverlay}>
          <Ionicons name="checkmark-circle" size={80} color={theme.safe} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.black,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: theme.background,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  settingsButton: {
    width: '100%',
    marginBottom: 12,
  },
  retryButton: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.white,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: theme.primary,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    top: undefined,
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderBottomWidth: 4,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    top: undefined,
    bottom: 0,
    left: undefined,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderTopLeftRadius: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: theme.primary,
    opacity: isDarkMode ? 0.9 : 0.8,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructionsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: theme.white,
    fontWeight: '500',
  },
  captureButton: {
    padding: 4,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.white,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: theme.white,
  },
});

export default ScannerScreen;
