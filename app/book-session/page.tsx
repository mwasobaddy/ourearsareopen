import { redirect } from "next/navigation";

export default function BookSessionRedirect() {
  redirect("/book-listener");
}
