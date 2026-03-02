import { Category } from '@/types';
import { FlatCategory } from '@/components/admin/categories/CategoryRow';

/**
 * Flatten a category tree into a linear array with depth info
 */
export function flattenCategories(
  nodes: Category[],
  parentId?: string,
  depth = 0
): FlatCategory[] {
  let result: FlatCategory[] = [];
  
  nodes.forEach((node, index) => {
    const { children, ...rest } = node;
    result.push({ ...rest, depth, parentId, index: result.length } as FlatCategory);
    
    if (children && children.length > 0) {
      result = result.concat(flattenCategories(children, node.id, depth + 1));
    }
  });
  
  return result;
}

/**
 * Reconstruct parent/child relationships from flat array based on depth
 * Each item's parent is the most recent item at depth-1
 */
export function resolveHierarchy(items: FlatCategory[]): Array<{ ID: string; ParentID?: string; OrderIndex: number }> {
  const result: Array<{ ID: string; ParentID?: string; OrderIndex: number }> = [];
  
  // Track the last item at each depth level - this will be the parent for next deeper level
  const parentAtDepth: (string | undefined)[] = [undefined];
  
  // Track order index per parent (not per depth)
  const orderByParent: Record<string, number> = { 'root': 0 };
  
  items.forEach((item) => {
    const depth = item.depth;
    
    // Trim the stack if we've moved back up to a shallower depth
    while (parentAtDepth.length > depth + 1) {
      parentAtDepth.pop();
    }
    
    // Parent is the item at depth-1 (or undefined for root)
    const parentID = depth > 0 ? parentAtDepth[depth] : undefined;
    const parentKey = parentID || 'root';
    
    // Get and increment order for this parent
    if (orderByParent[parentKey] === undefined) {
      orderByParent[parentKey] = 0;
    }
    const orderIndex = orderByParent[parentKey]++;
    
    result.push({
      ID: item.id,
      ParentID: parentID,
      OrderIndex: orderIndex
    });
    
    // This item becomes the potential parent for the next level
    if (parentAtDepth.length <= depth + 1) {
      parentAtDepth.push(item.id);
    } else {
      parentAtDepth[depth + 1] = item.id;
    }
  });
  
  return result;
}
