import fs from 'fs'
import path from 'path'

export interface Product {
  id: number
  name: string
  price: string
  originalPrice: string
  image: string
  discount: string
  description?: string
  category?: string
  inStock?: boolean
  rating?: number
  reviews?: number
}

class Database {
  private dbPath: string
  private dataDir: string

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.dbPath = path.join(this.dataDir, 'products.json')
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
      console.log('Created data directory:', this.dataDir)
    }
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'iPhone 14 Pro Max',
        price: 'AED 1,099',
        originalPrice: 'AED 1,499',
        image: '/iphone14F-removebg-preview.png',
        discount: '25% OFF',
        description: 'The latest iPhone with cutting-edge technology',
        category: 'Smartphones',
        inStock: true,
        rating: 4.8,
        reviews: 124
      },
      {
        id: 2,
        name: 'Apple Watch Series 8',
        price: 'AED 1,499',
        originalPrice: 'AED 1,899',
        image: '/iphone14s-removebg-preview.png',
        discount: '20% OFF',
        description: 'Advanced health monitoring and fitness tracking',
        category: 'Wearables',
        inStock: true,
        rating: 4.6,
        reviews: 89
      },
      {
        id: 3,
        name: 'AirPods Pro 2nd Gen',
        price: 'AED 749',
        originalPrice: 'AED 949',
        image: '/iphone14c-removebg-preview.png',
        discount: '20% OFF',
        description: 'Premium wireless earbuds with active noise cancellation',
        category: 'Audio',
        inStock: true,
        rating: 4.7,
        reviews: 156
      }
    ]
  }

  readProducts(): Product[] {
    try {
      this.ensureDataDir()

      // If file doesn't exist, create it with default products
      if (!fs.existsSync(this.dbPath)) {
        console.log('Products file does not exist, creating with default products...')
        const defaultProducts = this.getDefaultProducts()
        this.writeProducts(defaultProducts)
        return defaultProducts
      }

      // Read existing file
      const data = fs.readFileSync(this.dbPath, 'utf-8')
      const products = JSON.parse(data) as Product[]

      // Validate the data
      if (!Array.isArray(products)) {
        console.log('Invalid data format, creating new file with default products...')
        const defaultProducts = this.getDefaultProducts()
        this.writeProducts(defaultProducts)
        return defaultProducts
      }

      console.log(`Successfully loaded ${products.length} products from database`)
      return products
    } catch (error) {
      console.error('Error reading products:', error)
      console.log('Falling back to default products...')
      const defaultProducts = this.getDefaultProducts()
      this.writeProducts(defaultProducts)
      return defaultProducts
    }
  }

  writeProducts(products: Product[]): void {
    try {
      this.ensureDataDir()

      // Create backup before writing
      if (fs.existsSync(this.dbPath)) {
        const backupPath = `${this.dbPath}.backup`
        fs.copyFileSync(this.dbPath, backupPath)
        console.log('Created backup of existing products file')
      }

      // Write new data
      const data = JSON.stringify(products, null, 2)
      fs.writeFileSync(this.dbPath, data)

      // Verify the write
      const verifyData = fs.readFileSync(this.dbPath, 'utf-8')
      const verifyProducts = JSON.parse(verifyData)
      
      if (verifyProducts.length !== products.length) {
        throw new Error('Write verification failed: product count mismatch')
      }

      console.log(`Successfully wrote ${products.length} products to database`)
    } catch (error) {
      console.error('Error writing products:', error)
      throw error
    }
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.readProducts()
    const newId = Math.max(...products.map(p => p.id), 0) + 1
    
    const newProduct: Product = {
      id: newId,
      ...product
    }

    products.push(newProduct)
    this.writeProducts(products)
    
    console.log(`Added new product with ID: ${newId}`)
    return newProduct
  }

  updateProduct(id: number, updates: Partial<Product>): Product {
    const products = this.readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`)
    }

    products[index] = { ...products[index], ...updates, id }
    this.writeProducts(products)
    
    console.log(`Updated product with ID: ${id}`)
    return products[index]
  }

  deleteProduct(id: number): Product {
    const products = this.readProducts()
    const index = products.findIndex(p => p.id === id)
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`)
    }

    const deletedProduct = products[index]
    products.splice(index, 1)
    this.writeProducts(products)
    
    console.log(`Deleted product with ID: ${id}`)
    return deletedProduct
  }

  getProduct(id: number): Product | null {
    const products = this.readProducts()
    return products.find(p => p.id === id) || null
  }

  getAllProducts(): Product[] {
    return this.readProducts()
  }

  getProductsByCategory(category: string): Product[] {
    const products = this.readProducts()
    return products.filter(p => p.category === category)
  }

  getFeaturedProducts(): Product[] {
    const products = this.readProducts()
    return products.filter(p => p.discount && p.discount !== '0% OFF')
  }
}

// Export singleton instance
export const database = new Database() 