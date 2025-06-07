import ComponentsDatatablesDoucument from '@/components/datatables/components-datatables-document';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Document',
};

const Export = () => {
    return (
        <div>
      
            <ComponentsDatatablesDoucument />
        </div>
    );
};

export default Export;
