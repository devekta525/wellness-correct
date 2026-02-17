import Doctors from './our-doctors'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Doctors | Wellness Fuel",
  description: "Doctors | Wellness Fuel",
};

export default function DoctorsPage() {
  return (
    <>
      <Doctors />
    </>
  );
}