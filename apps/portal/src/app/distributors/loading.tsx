import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="distributors" layout="table" columns={6} secondary={true} summary={true} />;
}
