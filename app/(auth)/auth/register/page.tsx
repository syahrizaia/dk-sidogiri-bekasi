import { redirect } from "next/navigation";

export default function RegisterPage() {
  // Pendaftaran akun mandiri dinonaktifkan: seluruh akun dikelola dan dibuatkan langsung oleh Super Admin
  redirect("/auth/login");
}
