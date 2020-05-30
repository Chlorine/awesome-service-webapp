import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>Awesome Service</strong> &copy;{' '}
          <a href="https://soft.ru" target="_blank" rel="noopener noreferrer">
            Тикет Софт
          </a>{' '}
          2020
          <br />
          <small>Продукт самоизоляции</small>
        </p>
      </div>
    </footer>
  );
};
