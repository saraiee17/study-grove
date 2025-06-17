import { Welcome } from "../welcome/welcome";

export function meta() {
  return [
    { title: "Study Grove" },
    { name: "description", content: "Welcome to Study Grove!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
