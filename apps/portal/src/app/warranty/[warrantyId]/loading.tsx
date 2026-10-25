import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="warranty record" layout="detail" columns={5} secondary={false} summary={false} />;
}
