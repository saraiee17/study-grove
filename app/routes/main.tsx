import { Main } from "../main/main";

export function meta() {
  return [
    { title: "Study Grove - Main" },
    { name: "description", content: "Study Grove Main Page" },
  ];
}

export default function MainRoute() {
  return <Main />;
} 