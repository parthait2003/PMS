import ComponentsAuthLoginForm from './login/page';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Admin',
};

const Sales = () => {
    return <ComponentsAuthLoginForm />;
};

export default Sales;
