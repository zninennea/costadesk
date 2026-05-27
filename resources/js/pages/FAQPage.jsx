function FAQPage() {
  const faqs = [
    { q: "What are the check-in and check-out times?", a: "Check-in is at 3:00 PM and check-out is at 12:00 NN." },
    { q: "Is outside food and drinks allowed?", a: "No, outside food and drinks are strictly not permitted within the resort premises." },
    { q: "Are pets allowed?", a: "Unfortunately, pets are not allowed in the resort." },
    { q: "What payment methods are accepted?", a: "We accept cash, credit cards, and mobile payments." },
    { q: "Is there a cancellation policy?", a: "We have a no-cancellation, no-refund policy. Rebooking is allowed once." },
    { q: "What is the day tour schedule?", a: "Day tour guests can arrive at 6:30 AM and must depart by 4:00 PM." },
    { q: "Do you provide boat transport?", a: "Yes, boat service operates from 6:30 AM to 4:00 PM daily from Km. 9, Sasa, Davao City. Fare is ₱25 per person (minimum of 14 passengers) or ₱350 for chartered trips." },
    { q: "What recreational activities are available?", a: "We offer beach volleyball, billiards, darts, kayaking, jet skiing, banana boat rides, and a children's playground." }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-amber-50 pt-24">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">Find answers to common questions about Costa Marina Beach Resort</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer p-6 list-none">
                  <span className="font-semibold text-gray-800 text-lg">{faq.q}</span>
                  <span className="text-amber-500 group-open:rotate-180 transition-transform duration-300 text-xl">▼</span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQPage