import React from 'react';
import { createRoot } from 'react-dom/client';
import { RetentionApp } from './retention-app';
import './style.css';
const root = document.getElementById('root');
if (!root) throw new Error('Missing root element');
createRoot(root).render(<React.StrictMode><RetentionApp /></React.StrictMode>);
