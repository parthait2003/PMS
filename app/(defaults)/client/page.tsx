import ComponentsDatatablesClient from '@/components/datatables/components-datatables-client';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';
import DefaultLayout from '../layout';
export const metadata: Metadata = {
   
};

const Export = () => {
    return (
       
        <DefaultLayout>
            <ComponentsDatatablesClient />
        </DefaultLayout>
     
    );
};

export default Export;