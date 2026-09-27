import { completeTicket, readyTicket, startTicket } from "../services/kitchenApi";
import { useMutation } from "./useMutation";

export function useStartTicket() {
  return useMutation(startTicket);
}
export function useReadyTicket() {
  return useMutation(readyTicket);
}
export function useCompleteTicket() {
  return useMutation(completeTicket);
}
