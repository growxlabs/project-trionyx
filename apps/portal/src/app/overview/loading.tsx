import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="overview" layout="scorecard" columns={4} secondary={true} summary={false} />;
}
