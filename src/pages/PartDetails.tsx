import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { db } from '@/db/database';
import { deletePart } from '@/services/inventoryService';
import { formatCurrency, calculateProfitMargin } from '@/utils/currency';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Package, 
  Pencil, 
  Trash2, 
  ShoppingCart,
  MapPin,
  Tag,
  Layers,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PartDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const part = useLiveQuery(() => id ? db.parts.get(id) : undefined, [id]);
  const brand = useLiveQuery(
    () => part?.brandId ? db.brands.get(part.brandId) : undefined,
    [part?.brandId]
  );
  const category = useLiveQuery(
    () => part?.categoryId ? db.categories.get(part.categoryId) : undefined,
    [part?.categoryId]
  );

  if (!part) {
    return (
      <AppLayout hideNav>
        <Header title="Part Details" showBack />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Part not found</p>
        </div>
      </AppLayout>
    );
  }

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deletePart(id);
      toast.success('Part deleted successfully');
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to delete part:', error);
      toast.error('Failed to delete part');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const profitMargin = calculateProfitMargin(part.buyingPrice, part.sellingPrice);
  const profit = part.sellingPrice - part.buyingPrice;
  const isLowStock = part.quantity <= part.minStockLevel;
  const isOutOfStock = part.quantity === 0;

  return (
    <AppLayout hideNav>
      <Header 
        title="Part Details" 
        showBack
        rightAction={
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate(`/inventory/edit/${id}`)}
            >
              <Pencil className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="p-4 pb-24 space-y-4">
        {/* Images */}
        {part.images && part.images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {part.images.map((img, index) => (
              <div 
                key={index} 
                className="h-32 w-32 shrink-0 rounded-lg overflow-hidden bg-muted"
              >
                <img 
                  src={img} 
                  alt={`${part.name} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 w-full rounded-lg bg-muted flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Basic Info */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold">{part.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">SKU: {part.sku}</p>
              </div>
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge className="bg-warning text-warning-foreground">Low Stock</Badge>
              ) : (
                <Badge variant="secondary">In Stock</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{brand?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{category?.name || 'Unknown'}</span>
              </div>
              {part.location && (
                <div className="flex items-center gap-2 col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{part.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stock & Pricing */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className={cn(
                  'text-2xl font-bold mt-1',
                  isOutOfStock && 'text-destructive',
                  isLowStock && !isOutOfStock && 'text-warning'
                )}>
                  {part.quantity}
                </p>
                <p className="text-xs text-muted-foreground">
                  Min: {part.minStockLevel} {part.unitType}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="text-lg font-semibold mt-1 capitalize">
                  {part.unitType === 'custom' ? part.customUnit : part.unitType}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Buying Price</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(part.buyingPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Selling Price</p>
                <p className="text-lg font-semibold mt-1 text-primary">
                  {formatCurrency(part.sellingPrice)}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Profit Margin</span>
              </div>
              <div className="text-right">
                <p className={cn(
                  'font-semibold',
                  profit >= 0 ? 'text-primary' : 'text-destructive'
                )}>
                  {formatCurrency(profit)} ({profitMargin.toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {part.notes && (
          <Card className="bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{part.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p>{formatDate(part.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Updated</p>
                <p>{formatDate(part.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3 fixed-bottom-safe">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => navigate(`/inventory/edit/${id}`)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            className="flex-1 h-12"
            onClick={() => navigate('/sale')}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Sell
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Part?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{part.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
