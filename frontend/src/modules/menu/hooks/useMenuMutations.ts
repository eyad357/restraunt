import { useMenuServiceInstance } from "./useMenuQueries";
import { useMutation } from "./useMutation";

export function useCreateCategory() {
  const service = useMenuServiceInstance();
  return useMutation(service.createCategory.bind(service));
}
export function useUpdateCategory() {
  const service = useMenuServiceInstance();
  return useMutation(service.updateCategory.bind(service));
}

export function useCreateProduct() {
  const service = useMenuServiceInstance();
  return useMutation(service.createProduct.bind(service));
}
export function useUpdateProduct() {
  const service = useMenuServiceInstance();
  return useMutation(service.updateProduct.bind(service));
}

export function useCreateVariant() {
  const service = useMenuServiceInstance();
  return useMutation(service.createVariant.bind(service));
}
export function useUpdateVariant() {
  const service = useMenuServiceInstance();
  return useMutation(service.updateVariant.bind(service));
}

export function useCreateModifier() {
  const service = useMenuServiceInstance();
  return useMutation(service.createModifier.bind(service));
}
export function useUpdateModifier() {
  const service = useMenuServiceInstance();
  return useMutation(service.updateModifier.bind(service));
}
