import React from 'react'
import CommonHero from "@/components/common/common-hero";

const BookAppointment = () => {
  return (
    <div>
      {/* Header */}
      <CommonHero
        title="Book Appointment"
        description="Book an appointment with our team. We're here to help you with all your healthcare needs."
        image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=800&auto=format&fit=crop"
        breadcrumbs={[
          { label: "Book Appointment", href: "/book-appointment" },
        ]}
      />
    </div>
  )
}

export default BookAppointment