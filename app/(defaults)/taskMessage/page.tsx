import TaskMessageTable from '@/components/datatables/components-datatables-TaskMessage';
import IconBell from '@/components/icon/icon-bell';
import { Metadata } from 'next';
import React from 'react';
import DefaultLayout from '../layout';
export const metadata: Metadata = {
   
};

const Export = () => {
    return (
       
        <DefaultLayout>
            <TaskMessageTable />
        </DefaultLayout>
     
    );
};

export default Export;
