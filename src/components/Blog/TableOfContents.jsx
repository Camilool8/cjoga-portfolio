import { Link } from "react-scroll";

export default function TableOfContents({ items }) {
  return (
    <nav className="toc">
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className={`pl-${(item.level - 2) * 4}`}
            style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
          >
            <Link
              to={item.id}
              smooth={true}
              duration={500}
              offset={-100}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-accent dark:hover:text-dark-accent cursor-pointer transition-colors"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
