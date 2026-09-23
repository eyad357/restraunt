import { useMutation } from "./useMutation";
import { cancelOrder, createOrder, recordPayment, updateDelivery, voidPayment } from "../services/ordersApi";

export function useCreateOrder() {
  return useMutation(createOrder);
}

export function useCancelOrder() {
  return useMutation(cancelOrder);
}

export function useRecordPayment() {
  return useMutation(recordPayment);
}

export function useVoidPayment() {
  return useMutation(voidPayment);
}

export function useUpdateDelivery() {
  return useMutation(updateDelivery);
}
