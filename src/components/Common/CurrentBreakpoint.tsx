import React from 'react';

export const CurrentBreakpoint: React.FC<{ invisible?: boolean }> = ({
  invisible,
}) => {
  return (
    <span>
      {!invisible && (
        <span>
          <span className="is-hidden-mobile is-hidden-tablet-only is-hidden-desktop-only is-hidden-widescreen-only">
            full-hd &gt; 1408px
          </span>
          <span className="is-hidden-mobile is-hidden-tablet-only is-hidden-desktop-only is-hidden-fullhd">
            widescreen 1216px...1407px
          </span>
          <span className="is-hidden-mobile is-hidden-tablet-only is-hidden-widescreen is-hidden-fullhd">
            desktop 1024px...1215px
          </span>
          <span className="is-hidden-mobile is-hidden-widescreen is-hidden-desktop is-hidden-fullhd">
            tablet 769px...1023px
          </span>
          <span className="is-hidden-tablet is-hidden-widescreen is-hidden-fullhd">
            mobile up to 768px
          </span>
        </span>
      )}
    </span>
  );
};
