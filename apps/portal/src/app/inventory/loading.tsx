import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="inventory" layout="table" columns={7} secondary={true} summary={true} />;
}
