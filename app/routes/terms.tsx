export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand-gray">Terms and Conditions of Use</h1>
      <p className="mt-2 text-lg text-gray-500">Ribbon Fair, LLC.</p>
      <p className="mt-1 text-sm text-gray-400">Last updated: 2024</p>

      <div className="mt-8 space-y-10 text-gray-700 leading-relaxed">
        {/* Intro */}
        <section>
          <p>
            The terms and conditions contained below govern the use of the Ribbon Fair, LLC. web
            site. If you do not agree to the terms and conditions set forth below, please do not use
            the website or any information contained therein. By using the website and/or the
            information contained therein you agree to the terms set forth below.
          </p>
          <p className="mt-3">
            You are hereby granted permission to view, store, print, reproduce, and distribute any
            pages within this website, or portions thereof, for noncommercial use only in support of
            Ribbon Fair, LLC. services and/or products, provided that you do not modify any page, or
            any portions thereof. In addition, you agree not to use, reproduce or distribute any
            pages within this website, or portions thereof, in any manner inconsistent with the
            foregoing, or in any manner damaging to or disparaging the reputation of Ribbon Fair,
            LLC. or its services, products or personnel.
          </p>
        </section>

        {/* No Warranties */}
        <section>
          <h2 className="text-xl font-bold text-brand-gray">No Warranties, Express or Implied</h2>
          <p className="mt-3">
            This website is provided to you for your convenience and enjoyment, and for
            informational purposes. Ribbon Fair, LLC. assumes no liability whatsoever for the use or
            interpretation of any information contained herein. This publication is provided
            &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED,
            INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF THIRD PARTY RIGHTS. Some states do not allow
            the disclaimer of implied warranties so the foregoing disclaimer may not apply to you.
            This warranty gives you specific legal rights and you may also have other legal rights
            which vary from state to state.
          </p>
          <p className="mt-3">
            Although Ribbon Fair, LLC. has attempted to provide accurate and timely information on
            this website, Ribbon Fair, LLC. assumes no responsibility in connection therewith.
            Ribbon Fair, LLC. reserves the right to alter or delete any services or products
            contained herein without notice. IN NO EVENT SHALL Ribbon Fair, LLC. BE LIABLE FOR ANY
            SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, including, without limitation,
            lost profits or damages resulting from the use of or reliance upon any information
            provided on this website.
          </p>
          <p className="mt-3">
            From time to time, Ribbon Fair, LLC. may post on its website statements made by third
            parties. Ribbon Fair, LLC. may, but is not obligated to monitor such third party
            statements for accuracy, legality, ownership or other characteristics, and makes no
            representations in connection therewith. Ribbon Fair, LLC. expressly disclaims any and
            all liability for such third party statements.
          </p>
        </section>

        {/* No Endorsement */}
        <section>
          <h2 className="text-xl font-bold text-brand-gray">
            No Endorsement of Third Party Links
          </h2>
          <p className="mt-3">
            All product and brand names mentioned on this website are trademarks of their respective
            owners, and any mention thereof on this website is for informational purposes only and
            does not necessarily constitute an endorsement or a recommendation thereof by Ribbon
            Fair, LLC. or its personnel. This website contains links to other resources on the
            Internet. Those links are provided solely for your convenience and to assist you in
            locating other Internet resources that may be of interest to you.
          </p>
        </section>

        {/* Subject to Change */}
        <section>
          <h2 className="text-xl font-bold text-brand-gray">
            Policies and Terms Subject to Change Without Notice
          </h2>
          <p className="mt-3">
            We endeavor to notify our users of any changes in our policies, legal notices and
            disclaimers. However, in order to allow Ribbon Fair, LLC. to quickly and efficiently
            update, improve and manage this site, we reserve the right to make such changes, in our
            sole discretion, at any time without notice.
          </p>
          <p className="mt-3">
            Before participating in any offers and/or promotions, please read the fine print
            associated with it and verify independently that any merchant you are doing business with
            is legitimate and reputable. If you have any questions or comments, feel free to contact
            us at{' '}
            <a href="tel:952-238-9702" className="font-semibold text-brand-red hover:underline">
              952-238-9702
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
