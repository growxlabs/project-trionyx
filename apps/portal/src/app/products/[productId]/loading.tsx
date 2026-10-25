import { WorkspaceSkeleton } from '@trionyx/ui';

export default function Loading() {
  return <WorkspaceSkeleton label="products record" layout="product" columns={5} secondary={false} summary={false} />;
}
