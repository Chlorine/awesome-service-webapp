import React from 'react';
import { NavLink } from 'react-router-dom';

export type MenuSection = {
  title: string;
  items: Array<{
    title: string;
    linkTo: string;
    isDanger?: boolean;
  }>;
};

export const SideMenu: React.FC<{
  basePath: string;
  sections: MenuSection[];
}> = ({ sections, basePath }) => {
  return (
    <aside className="menu">
      {sections.map((s, index) => (
        <React.Fragment key={index}>
          <p className="menu-label">{s.title}</p>
          <ul className="menu-list">
            {s.items.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={basePath + item.linkTo}
                  activeClassName={
                    item.isDanger
                      ? 'has-background-danger has-text-white'
                      : 'is-active'
                  }
                >
                  {item.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </React.Fragment>
      ))}
    </aside>
  );
};
