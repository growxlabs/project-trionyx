'use client';
import { useRouter } from 'next/navigation';
import { SerialNumberLookupModal } from '../../../../components/inventory/SerialNumberLookupModal';

export function SerialRecordView({ serialNumber }: { serialNumber: string }) {
  const router = useRouter();
  return <main className="p-8"><h1 className="text-xl font-semibold">Inventory · {serialNumber}</h1>
    <SerialNumberLookupModal isOpen onClose={() => router.push('/inventory')} initialSerialNumber={serialNumber} />
  </main>;
}
