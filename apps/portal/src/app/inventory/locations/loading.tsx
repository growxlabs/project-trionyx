import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="inventory locations" layout="table" columns={5} secondary={false} summary={false} />;
}
