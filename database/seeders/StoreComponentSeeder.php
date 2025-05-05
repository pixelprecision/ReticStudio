<?php
// database/seeders/StoreComponentSeeder.php

namespace Database\Seeders;

use App\Models\Component;
use Illuminate\Database\Seeder;

class StoreComponentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create store components for the page builder
        $components = [
            [
                'name' => 'Category Grid',
                'slug' => 'category-grid',
                'description' => 'Grid layout to display product categories.',
                'category' => 'store',
                'icon' => 'store',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'label' => 'Title',
                            'placeholder' => 'Enter title',
                            'default' => 'Shop by Category',
                        ],
                        'subtitle' => [
                            'type' => 'text',
                            'label' => 'Subtitle',
                            'placeholder' => 'Enter subtitle',
                            'default' => 'Browse our wide range of categories',
                        ],
                        'columns' => [
                            'type' => 'select',
                            'label' => 'Columns',
                            'options' => [
                                ['value' => '1', 'label' => '1 Column'],
                                ['value' => '2', 'label' => '2 Columns'],
                                ['value' => '3', 'label' => '3 Columns'],
                                ['value' => '4', 'label' => '4 Columns'],
                                ['value' => '5', 'label' => '5 Columns'],
                                ['value' => '6', 'label' => '6 Columns'],
                            ],
                            'default' => '3',
                        ],
                        'showDescription' => [
                            'type' => 'boolean',
                            'label' => 'Show Description',
                            'default' => true,
                        ],
                        'showCount' => [
                            'type' => 'boolean',
                            'label' => 'Show Product Count',
                            'default' => true,
                        ],
                        'emptyMessage' => [
                            'type' => 'text',
                            'label' => 'Empty Message',
                            'placeholder' => 'Message when no categories found',
                            'default' => 'No categories found',
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <CategoryGridComponent
                  title={props.title}
                  subtitle={props.subtitle}
                  columns={props.columns}
                  showDescription={props.showDescription}
                  showCount={props.showCount}
                  emptyMessage={props.emptyMessage}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
            [
                'name' => 'Category List',
                'slug' => 'category-list',
                'description' => 'List layout to display product categories.',
                'category' => 'store',
                'icon' => 'list',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'label' => 'Title',
                            'placeholder' => 'Enter title',
                            'default' => 'Product Categories',
                        ],
                        'subtitle' => [
                            'type' => 'text',
                            'label' => 'Subtitle',
                            'placeholder' => 'Enter subtitle',
                            'default' => 'Explore our collections',
                        ],
                        'showDescription' => [
                            'type' => 'boolean',
                            'label' => 'Show Description',
                            'default' => true,
                        ],
                        'showCount' => [
                            'type' => 'boolean',
                            'label' => 'Show Product Count',
                            'default' => true,
                        ],
                        'showImage' => [
                            'type' => 'boolean',
                            'label' => 'Show Image',
                            'default' => true,
                        ],
                        'emptyMessage' => [
                            'type' => 'text',
                            'label' => 'Empty Message',
                            'placeholder' => 'Message when no categories found',
                            'default' => 'No categories found',
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <CategoryListComponent
                  title={props.title}
                  subtitle={props.subtitle}
                  showDescription={props.showDescription}
                  showCount={props.showCount}
                  showImage={props.showImage}
                  emptyMessage={props.emptyMessage}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
            [
                'name' => 'Category Menu',
                'slug' => 'category-menu',
                'description' => 'Navigation menu for product categories. Use in headers and footers.',
                'category' => 'navigation',
                'icon' => 'menu',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'label' => 'Title',
                            'placeholder' => 'Enter title',
                            'default' => 'Shop Categories',
                        ],
                        'showTitle' => [
                            'type' => 'boolean',
                            'label' => 'Show Title',
                            'default' => true,
                        ],
                        'maxDepth' => [
                            'type' => 'select',
                            'label' => 'Maximum Category Depth',
                            'options' => [
                                ['value' => '1', 'label' => '1 Level'],
                                ['value' => '2', 'label' => '2 Levels'],
                                ['value' => '3', 'label' => '3 Levels'],
                            ],
                            'default' => '2',
                        ],
                        'alignment' => [
                            'type' => 'select',
                            'label' => 'Alignment',
                            'options' => [
                                ['value' => 'left', 'label' => 'Left'],
                                ['value' => 'center', 'label' => 'Center'],
                                ['value' => 'right', 'label' => 'Right'],
                            ],
                            'default' => 'left',
                        ],
                        'variant' => [
                            'type' => 'select',
                            'label' => 'Menu Variant',
                            'options' => [
                                ['value' => 'dropdown', 'label' => 'Dropdown Menu'],
                                ['value' => 'horizontal', 'label' => 'Horizontal Menu'],
                                ['value' => 'vertical', 'label' => 'Vertical Menu'],
                            ],
                            'default' => 'dropdown',
                        ],
                        'categoryLimit' => [
                            'type' => 'number',
                            'label' => 'Category Limit',
                            'placeholder' => 'Limit number of top-level categories (0 for all)',
                            'default' => 10,
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <CategoryMenuComponent
                  title={props.title}
                  showTitle={props.showTitle}
                  maxDepth={props.maxDepth}
                  alignment={props.alignment}
                  variant={props.variant}
                  categoryLimit={props.categoryLimit}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
            [
                'name' => 'Product Grid',
                'slug' => 'product-grid',
                'description' => 'Grid layout to display products.',
                'category' => 'store',
                'icon' => 'grid',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'label' => 'Title',
                            'placeholder' => 'Enter title',
                            'default' => 'Featured Products',
                        ],
                        'subtitle' => [
                            'type' => 'text',
                            'label' => 'Subtitle',
                            'placeholder' => 'Enter subtitle',
                            'default' => 'Check out our latest products',
                        ],
                        'columns' => [
                            'type' => 'select',
                            'label' => 'Columns',
                            'options' => [
                                ['value' => '1', 'label' => '1 Column'],
                                ['value' => '2', 'label' => '2 Columns'],
                                ['value' => '3', 'label' => '3 Columns'],
                                ['value' => '4', 'label' => '4 Columns'],
                                ['value' => '5', 'label' => '5 Columns'],
                                ['value' => '6', 'label' => '6 Columns'],
                            ],
                            'default' => '3',
                        ],
                        'perPage' => [
                            'type' => 'number',
                            'label' => 'Products Per Page',
                            'default' => 9,
                        ],
                        'sortBy' => [
                            'type' => 'select',
                            'label' => 'Sort By',
                            'options' => [
                                ['value' => 'created_at', 'label' => 'Newest First'],
                                ['value' => 'name', 'label' => 'Name'],
                                ['value' => 'default_price', 'label' => 'Price'],
                            ],
                            'default' => 'created_at',
                        ],
                        'sortDirection' => [
                            'type' => 'select',
                            'label' => 'Sort Direction',
                            'options' => [
                                ['value' => 'desc', 'label' => 'Descending'],
                                ['value' => 'asc', 'label' => 'Ascending'],
                            ],
                            'default' => 'desc',
                        ],
                        'categoryId' => [
                            'type' => 'text',
                            'label' => 'Category ID',
                            'placeholder' => 'Filter by category ID (optional)',
                            'default' => '',
                        ],
                        'brandId' => [
                            'type' => 'text',
                            'label' => 'Brand ID',
                            'placeholder' => 'Filter by brand ID (optional)',
                            'default' => '',
                        ],
                        'showPagination' => [
                            'type' => 'boolean',
                            'label' => 'Show Pagination',
                            'default' => true,
                        ],
                        'showPrice' => [
                            'type' => 'boolean',
                            'label' => 'Show Price',
                            'default' => true,
                        ],
                        'showBrand' => [
                            'type' => 'boolean',
                            'label' => 'Show Brand',
                            'default' => true,
                        ],
                        'showStock' => [
                            'type' => 'boolean',
                            'label' => 'Show Stock Status',
                            'default' => true,
                        ],
                        'addToCartButton' => [
                            'type' => 'boolean',
                            'label' => 'Show Add to Cart Button',
                            'default' => true,
                        ],
                        'emptyMessage' => [
                            'type' => 'text',
                            'label' => 'Empty Message',
                            'placeholder' => 'Message when no products found',
                            'default' => 'No products found',
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <ProductGridComponent
                  title={props.title}
                  subtitle={props.subtitle}
                  columns={props.columns}
                  perPage={props.perPage}
                  sortBy={props.sortBy}
                  sortDirection={props.sortDirection}
                  categoryId={props.categoryId}
                  brandId={props.brandId}
                  showPagination={props.showPagination}
                  showPrice={props.showPrice}
                  showBrand={props.showBrand}
                  showStock={props.showStock}
                  addToCartButton={props.addToCartButton}
                  emptyMessage={props.emptyMessage}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
            [
                'name' => 'Product List',
                'slug' => 'product-list',
                'description' => 'List layout to display products.',
                'category' => 'store',
                'icon' => 'list',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'title' => [
                            'type' => 'text',
                            'label' => 'Title',
                            'placeholder' => 'Enter title',
                            'default' => 'Our Products',
                        ],
                        'subtitle' => [
                            'type' => 'text',
                            'label' => 'Subtitle',
                            'placeholder' => 'Enter subtitle',
                            'default' => 'Browse our selection',
                        ],
                        'perPage' => [
                            'type' => 'number',
                            'label' => 'Products Per Page',
                            'default' => 5,
                        ],
                        'sortBy' => [
                            'type' => 'select',
                            'label' => 'Sort By',
                            'options' => [
                                ['value' => 'created_at', 'label' => 'Newest First'],
                                ['value' => 'name', 'label' => 'Name'],
                                ['value' => 'default_price', 'label' => 'Price'],
                            ],
                            'default' => 'created_at',
                        ],
                        'sortDirection' => [
                            'type' => 'select',
                            'label' => 'Sort Direction',
                            'options' => [
                                ['value' => 'desc', 'label' => 'Descending'],
                                ['value' => 'asc', 'label' => 'Ascending'],
                            ],
                            'default' => 'desc',
                        ],
                        'categoryId' => [
                            'type' => 'text',
                            'label' => 'Category ID',
                            'placeholder' => 'Filter by category ID (optional)',
                            'default' => '',
                        ],
                        'brandId' => [
                            'type' => 'text',
                            'label' => 'Brand ID',
                            'placeholder' => 'Filter by brand ID (optional)',
                            'default' => '',
                        ],
                        'showPagination' => [
                            'type' => 'boolean',
                            'label' => 'Show Pagination',
                            'default' => true,
                        ],
                        'showImage' => [
                            'type' => 'boolean',
                            'label' => 'Show Image',
                            'default' => true,
                        ],
                        'showPrice' => [
                            'type' => 'boolean',
                            'label' => 'Show Price',
                            'default' => true,
                        ],
                        'showDescription' => [
                            'type' => 'boolean',
                            'label' => 'Show Description',
                            'default' => true,
                        ],
                        'showBrand' => [
                            'type' => 'boolean',
                            'label' => 'Show Brand',
                            'default' => true,
                        ],
                        'showStock' => [
                            'type' => 'boolean',
                            'label' => 'Show Stock Status',
                            'default' => true,
                        ],
                        'addToCartButton' => [
                            'type' => 'boolean',
                            'label' => 'Show Add to Cart Button',
                            'default' => true,
                        ],
                        'emptyMessage' => [
                            'type' => 'text',
                            'label' => 'Empty Message',
                            'placeholder' => 'Message when no products found',
                            'default' => 'No products found',
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <ProductListComponent
                  title={props.title}
                  subtitle={props.subtitle}
                  perPage={props.perPage}
                  sortBy={props.sortBy}
                  sortDirection={props.sortDirection}
                  categoryId={props.categoryId}
                  brandId={props.brandId}
                  showPagination={props.showPagination}
                  showImage={props.showImage}
                  showPrice={props.showPrice}
                  showDescription={props.showDescription}
                  showBrand={props.showBrand}
                  showStock={props.showStock}
                  addToCartButton={props.addToCartButton}
                  emptyMessage={props.emptyMessage}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
            [
                'name' => 'Product Page',
                'slug' => 'product-page',
                'description' => 'Detailed product page with image gallery, description, and add to cart functionality.',
                'category' => 'store',
                'icon' => 'product',
                'is_system' => true,
                'is_active' => true,
                'schema' => json_encode([
                    'properties' => [
                        'productId' => [
                            'type' => 'text',
                            'label' => 'Product ID',
                            'placeholder' => 'Enter product ID (optional if using slug or URL parameter)',
                            'default' => '',
                        ],
                        'slug' => [
                            'type' => 'text',
                            'label' => 'Product Slug',
                            'placeholder' => 'Enter product slug (optional if using ID or URL parameter)',
                            'default' => '',
                        ],
                        'showRelatedProducts' => [
                            'type' => 'boolean',
                            'label' => 'Show Related Products',
                            'default' => true,
                        ],
                        'showQuantitySelector' => [
                            'type' => 'boolean',
                            'label' => 'Show Quantity Selector',
                            'default' => true,
                        ],
                        'showBrand' => [
                            'type' => 'boolean',
                            'label' => 'Show Brand',
                            'default' => true,
                        ],
                        'showCategory' => [
                            'type' => 'boolean',
                            'label' => 'Show Category',
                            'default' => true,
                        ],
                        'showSKU' => [
                            'type' => 'boolean',
                            'label' => 'Show SKU',
                            'default' => true,
                        ],
                        'showShortDescription' => [
                            'type' => 'boolean',
                            'label' => 'Show Short Description',
                            'default' => true,
                        ],
                        'tabSections' => [
                            'type' => 'boolean',
                            'label' => 'Show Tab Sections',
                            'default' => true,
                        ],
                    ],
                ]),
                'template' => <<<'EOT'
                <ProductPageComponent
                  productId={props.productId}
                  slug={props.slug}
                  showRelatedProducts={props.showRelatedProducts}
                  showQuantitySelector={props.showQuantitySelector}
                  showBrand={props.showBrand}
                  showCategory={props.showCategory}
                  showSKU={props.showSKU}
                  showShortDescription={props.showShortDescription}
                  tabSections={props.tabSections}
                  componentId={id}
                  extraClasses={props.extraClasses}
                />
EOT,
            ],
        ];
        
        foreach ($components as $component) {
            Component::create($component);
        }
    }
}