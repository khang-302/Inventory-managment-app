import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { db } from '@/db/database';
import { createPart, updatePart, isSkuUnique } from '@/services/inventoryService';
import { createBrand } from '@/services/brandService';
import { createCategory } from '@/services/categoryService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Camera, X } from 'lucide-react';
import type { UnitType } from '@/types';

// Predefined categories
const PREDEFINED_CATEGORIES = [
  'Engine',
  'Hydraulic',
  'Electric',
  'Transmission',
  'Brake',
  'Cooling',
];

// Predefined brands
const PREDEFINED_BRANDS = [
  'ITR',
  'CAT',
  'FP Diesel',
  'Highgasket',
  'ASP',
  'DSG',
  'World Gasket',
  'DISA',
  'HDP',
  'CGR',
  'Bull Dog',
  'METARIS',
];

const partSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50),
  brandId: z.string().min(1, 'Please select a brand'),
  categoryId: z.string().min(1, 'Please select a category'),
  unitType: z.enum(['piece', 'set', 'pair', 'box', 'custom']),
  customUnit: z.string().optional(),
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
  minStockLevel: z.coerce.number().int().min(0),
  buyingPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  sellingPrice: z.coerce.number().min(0, 'Price cannot be negative'),
  location: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type PartFormValues = z.infer<typeof partSchema>;

export default function AddEditPart() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  // Custom brand/category states
  const [brandSelection, setBrandSelection] = useState<string>('');
  const [categorySelection, setCategorySelection] = useState<string>('');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [brandError, setBrandError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  // Load existing part if editing
  const existingPart = useLiveQuery(
    () => id ? db.parts.get(id) : undefined,
    [id]
  );

  // Load saved brands and categories from database
  const savedBrands = useLiveQuery(() => db.brands.toArray(), []) ?? [];
  const savedCategories = useLiveQuery(() => db.categories.toArray(), []) ?? [];

  // Combine predefined with user-added (avoiding duplicates) — memoized to prevent infinite re-renders
  const allBrands = useMemo(() => [
    ...PREDEFINED_BRANDS.map(name => ({ id: `predefined-${name}`, name, isPredefined: true })),
    ...savedBrands.filter(b => !PREDEFINED_BRANDS.includes(b.name)).map(b => ({ ...b, isPredefined: false })),
  ], [savedBrands]);
  
  const allCategories = useMemo(() => [
    ...PREDEFINED_CATEGORIES.map(name => ({ id: `predefined-${name}`, name, isPredefined: true })),
    ...savedCategories.filter(c => !PREDEFINED_CATEGORIES.includes(c.name)).map(c => ({ ...c, isPredefined: false })),
  ], [savedCategories]);

  const form = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      sku: '',
      brandId: '',
      categoryId: '',
      unitType: 'piece',
      customUnit: '',
      quantity: 0,
      minStockLevel: 5,
      buyingPrice: 0,
      sellingPrice: 0,
      location: '',
      notes: '',
    },
  });

  // Guard to prevent re-running edit initialization
  const hasSetInitialValues = useRef(false);

  // Update form when existing part loads
  useEffect(() => {
    if (existingPart && !hasSetInitialValues.current) {
      hasSetInitialValues.current = true;
      form.reset({
        name: existingPart.name,
        sku: existingPart.sku,
        brandId: existingPart.brandId,
        categoryId: existingPart.categoryId,
        unitType: existingPart.unitType,
        customUnit: existingPart.customUnit || '',
        quantity: existingPart.quantity,
        minStockLevel: existingPart.minStockLevel,
        buyingPrice: existingPart.buyingPrice,
        sellingPrice: existingPart.sellingPrice,
        location: existingPart.location || '',
        notes: existingPart.notes || '',
      });
      setImages(existingPart.images || []);
      
      // Set selections based on existing part — match by ID only
      const existingBrand = allBrands.find(b => b.id === existingPart.brandId);
      const existingCategory = allCategories.find(c => c.id === existingPart.categoryId);
      
      if (existingBrand) {
        setBrandSelection(existingBrand.id);
      }
      if (existingCategory) {
        setCategorySelection(existingCategory.id);
      }
    }
  }, [existingPart, allBrands, allCategories]);

  // Handle brand selection change
  const handleBrandChange = async (value: string) => {
    setBrandSelection(value);
    setBrandError('');
    setCustomBrandName('');
    
    if (value === 'custom') {
      form.setValue('brandId', '');
    } else if (value.startsWith('predefined-')) {
      // For predefined brands, check if it exists in DB or create it
      const brandName = value.replace('predefined-', '');
      const existingBrand = savedBrands.find(b => b.name === brandName);
      if (existingBrand) {
        form.setValue('brandId', existingBrand.id);
      } else {
        // Create the predefined brand in DB
        const brand = await createBrand(brandName);
        form.setValue('brandId', brand.id);
      }
    } else {
      form.setValue('brandId', value);
    }
  };

  // Handle category selection change
  const handleCategoryChange = async (value: string) => {
    setCategorySelection(value);
    setCategoryError('');
    setCustomCategoryName('');
    
    if (value === 'custom') {
      form.setValue('categoryId', '');
    } else if (value.startsWith('predefined-')) {
      // For predefined categories, check if it exists in DB or create it
      const categoryName = value.replace('predefined-', '');
      const existingCategory = savedCategories.find(c => c.name === categoryName);
      if (existingCategory) {
        form.setValue('categoryId', existingCategory.id);
      } else {
        // Create the predefined category in DB
        const category = await createCategory(categoryName);
        form.setValue('categoryId', category.id);
      }
    } else {
      form.setValue('categoryId', value);
    }
  };

  // Save custom brand
  const saveCustomBrand = async () => {
    if (!customBrandName.trim()) {
      setBrandError('Please enter a brand name');
      return false;
    }
    
    // Check if brand already exists
    const existingBrand = savedBrands.find(
      b => b.name.toLowerCase() === customBrandName.trim().toLowerCase()
    );
    
    if (existingBrand) {
      form.setValue('brandId', existingBrand.id);
      toast.info('Brand already exists, selected it');
      return true;
    }
    
    try {
      const brand = await createBrand(customBrandName.trim());
      form.setValue('brandId', brand.id);
      toast.success('Custom brand saved');
      return true;
    } catch (error) {
      toast.error('Failed to save brand');
      return false;
    }
  };

  // Save custom category
  const saveCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      setCategoryError('Please enter a category name');
      return false;
    }
    
    // Check if category already exists
    const existingCategory = savedCategories.find(
      c => c.name.toLowerCase() === customCategoryName.trim().toLowerCase()
    );
    
    if (existingCategory) {
      form.setValue('categoryId', existingCategory.id);
      toast.info('Category already exists, selected it');
      return true;
    }
    
    try {
      const category = await createCategory(customCategoryName.trim());
      form.setValue('categoryId', category.id);
      toast.success('Custom category saved');
      return true;
    } catch (error) {
      toast.error('Failed to save category');
      return false;
    }
  };

  const onSubmit = async (data: PartFormValues) => {
    // Validate custom fields before submit
    if (brandSelection === 'custom' && !form.getValues('brandId')) {
      const saved = await saveCustomBrand();
      if (!saved) return;
    }
    
    if (categorySelection === 'custom' && !form.getValues('categoryId')) {
      const saved = await saveCustomCategory();
      if (!saved) return;
    }
    
    // Re-get form values after potential custom saves
    const currentData = form.getValues();
    
    if (!currentData.brandId) {
      setBrandError('Please select or enter a brand');
      return;
    }
    
    if (!currentData.categoryId) {
      setCategoryError('Please select or enter a category');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Check SKU uniqueness
      const skuUnique = await isSkuUnique(currentData.sku, id);
      if (!skuUnique) {
        form.setError('sku', { message: 'This SKU already exists' });
        setIsSubmitting(false);
        return;
      }

      const partData = {
        name: currentData.name,
        sku: currentData.sku,
        brandId: currentData.brandId,
        categoryId: currentData.categoryId,
        unitType: currentData.unitType,
        customUnit: currentData.customUnit,
        quantity: currentData.quantity,
        minStockLevel: currentData.minStockLevel,
        buyingPrice: currentData.buyingPrice,
        sellingPrice: currentData.sellingPrice,
        location: currentData.location || '',
        notes: currentData.notes || '',
        images,
      };

      if (isEditing && id) {
        await updatePart(id, partData);
        toast.success('Part updated successfully');
      } else {
        await createPart(partData);
        toast.success('Part added successfully');
      }

      navigate('/inventory');
    } catch (error) {
      console.error('Failed to save part:', error);
      toast.error('Failed to save part');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    Array.from(files).forEach(file => {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image "${file.name}" exceeds 5MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Compress image via canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1200;
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setImages(prev => [...prev, compressed]);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const watchUnitType = form.watch('unitType');

  return (
    <AppLayout hideNav>
      <Header 
        title={isEditing ? 'Edit Part' : 'Add Part'} 
        showBack 
      />

      <div className="p-4 pb-24">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Images */}
            <Card className="bg-card">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Images (max 5)</p>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, index) => (
                    <div key={index} className="relative h-16 w-16">
                      <img 
                        src={img} 
                        alt={`Part ${index + 1}`}
                        className="h-full w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="h-16 w-16 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleImageCapture}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="bg-card">
              <CardContent className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Brake Pad Set" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., BP-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                <div className="space-y-2">
                  <FormLabel>Select Category *</FormLabel>
                  <Select 
                    value={categorySelection} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border">
                      <SelectItem value="custom" className="text-primary font-medium">
                        + Custom
                      </SelectItem>
                      {allCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Category Input */}
                  {categorySelection === 'custom' && (
                    <div className="space-y-2 animate-fade-in">
                      <Input
                        placeholder="Enter custom category name"
                        value={customCategoryName}
                        onChange={(e) => {
                          setCustomCategoryName(e.target.value);
                          setCategoryError('');
                        }}
                        onBlur={async () => {
                          if (customCategoryName.trim()) {
                            await saveCustomCategory();
                          }
                        }}
                        className="mt-2"
                      />
                      {categoryError && (
                        <p className="text-sm text-destructive">{categoryError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Brand Selection */}
                <div className="space-y-2">
                  <FormLabel>Select Brand *</FormLabel>
                  <Select 
                    value={brandSelection} 
                    onValueChange={handleBrandChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border max-h-60">
                      <SelectItem value="custom" className="text-primary font-medium">
                        + Custom
                      </SelectItem>
                      {allBrands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Custom Brand Input */}
                  {brandSelection === 'custom' && (
                    <div className="space-y-2 animate-fade-in">
                      <Input
                        placeholder="Enter brand name"
                        value={customBrandName}
                        onChange={(e) => {
                          setCustomBrandName(e.target.value);
                          setBrandError('');
                        }}
                        onBlur={async () => {
                          if (customBrandName.trim()) {
                            await saveCustomBrand();
                          }
                        }}
                        className="mt-2"
                      />
                      {brandError && (
                        <p className="text-sm text-destructive">{brandError}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stock & Pricing */}
            <Card className="bg-card">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unitType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-popover border border-border">
                            <SelectItem value="piece">Piece</SelectItem>
                            <SelectItem value="set">Set</SelectItem>
                            <SelectItem value="pair">Pair</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchUnitType === 'custom' && (
                    <FormField
                      control={form.control}
                      name="customUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Dozen" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} onFocus={(e) => e.target.select()} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="minStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Min Stock Level</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} onFocus={(e) => e.target.select()} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="buyingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buying Price (Rs)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} onFocus={(e) => e.target.select()} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (Rs)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="1" {...field} onFocus={(e) => e.target.select()} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="bg-card">
              <CardContent className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Shelf A3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes..." 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Update Part' : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
