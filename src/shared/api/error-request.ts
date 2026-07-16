import axios from "axios";
import { router } from "@routes/router";

export class ErrorRequest {
  protected handleError(error: unknown): never {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      router.navigate("/login", { replace: true });
    }

    throw error;
  }
}
