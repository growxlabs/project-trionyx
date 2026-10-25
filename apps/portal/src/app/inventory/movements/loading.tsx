import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="inventory movements" layout="table" columns={7} secondary={false} summary={false} />;
}
