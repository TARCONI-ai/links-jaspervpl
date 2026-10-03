import { HOME_HREF } from '../../config/socialLinks';
import ProjectShowcaseScreen from './ProjectShowcaseScreen';

type OpoGeniusScreenProps = Readonly<{
  onBack: () => void;
}>;

export default function OpoGeniusScreen({ onBack }: OpoGeniusScreenProps) {
  return (
    <ProjectShowcaseScreen
      onBack={onBack}
      iconSrc="/opogenius/icon.jpg"
      iconAlt="OpoGenius"
      title="OpoGenius"
      subtitle="Study companion · iOS app"
      ctaLabel="App Store"
      ctaHref={HOME_HREF.opogenius}
      secondaryCta={{ label: 'Case Study', href: HOME_HREF.caseStudy }}
      stats={[
        { label: 'Platform', value: 'iOS' },
        { label: 'Category', value: 'Education' },
        { label: 'Price', value: 'Free' },
      ]}
      features={[
        'Syllabus organised by subject, block and topic',
        'Smart review reminders based on difficulty and exam dates',
        'Study sessions, streaks and XP levels',
        'Exam calendar and daily reminders',
        'Stats: total hours and mastered topics',
        'Privacy first: data stays on your device',
      ]}
      previewImages={['/opogenius/prev1.jpg', '/opogenius/prev2.jpg', '/opogenius/prev3.jpg']}
      description="OpoGenius helps Spanish public-exam candidates (oposiciones) study consistently. It structures the syllabus, schedules spaced reviews and keeps motivation up with streaks and ranks. Built and shipped solo, end to end: product, design, code and launch."
      stack="Designed & built by Jasper van Puffelen López"
    />
  );
}
