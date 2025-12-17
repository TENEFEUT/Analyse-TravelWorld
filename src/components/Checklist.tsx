export default function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map(item => (
        <li key={item} className="flex gap-2">
          <input type="checkbox" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
