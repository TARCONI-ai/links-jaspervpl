import { HOME_HREF } from '../../config/socialLinks';
import ProjectShowcaseScreen from './ProjectShowcaseScreen';

type BookScreenProps = Readonly<{
  onBack: () => void;
}>;

export default function BookScreen({ onBack }: BookScreenProps) {
  return (
    <ProjectShowcaseScreen
      onBack={onBack}
      iconShape="cover"
      iconSrc="/book/cover.jpg"
      iconAlt="Estoy muerto vivo book cover"
      title="Estoy muerto vivo"
      subtitle="Una historia del Camino de Santiago"
      ctaLabel="Get on Amazon"
      ctaHref={HOME_HREF.book}
      stats={[
        { label: 'Format', value: 'Kindle' },
        { label: 'Genre', value: 'Memoir' },
        { label: 'Language', value: 'Spanish' },
      ]}
      featuresTitle="What it's about"
      features={[
        'Five friends walking the Camino de Santiago',
        'Friendship, perseverance and self-discovery',
        'Written like a letter to a friend',
      ]}
      previewImages={['/book/cover.jpg']}
      previewTitle="Cover"
      description="A chronicle of five friends who set out on the Camino de Santiago. Not a bestseller, just walking, sweating, laughing and writing about it, so you can feel the road without leaving your armchair."
      stack="Self-published on Amazon · Rated on Goodreads"
    />
  );
}
