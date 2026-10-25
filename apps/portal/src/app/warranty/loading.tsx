import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="warranty" layout="table" columns={7} secondary={false} summary={true} />;
}
