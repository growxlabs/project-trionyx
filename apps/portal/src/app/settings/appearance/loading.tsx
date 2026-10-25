import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="settings appearance" layout="appearance" columns={5} secondary={false} summary={false} />;
}
