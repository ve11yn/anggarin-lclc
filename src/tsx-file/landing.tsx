import Navigation1 from "./navigation1";
import "../css/landing.css"

const Landing = () => {
    return (
        <div className="landing-page">
            <Navigation1 />

            {/* Hero Section (no box) */}
            <section id="section1">
                <h1>Tracking Every <b>Rupiah</b>,</h1>
                <h1>Securing Every <b>Purpose</b></h1>
                <div id="section1-button">
                    <button>Track Public Budget Plans</button>
                    <button>Create Budget Plan</button>
                </div>
            </section>

            {/* Combined Info, How We Work, and Testimonials Section */}
            <section className="info-how-testimonials-section">
                <div className="stats-description">
                    <h2>Trusted by</h2>
                    <div className="stats-row">
                        <div>
                            <h2>100</h2>
                            <p>Donors</p>
                        </div>
                        <div>
                            <h2>20</h2>
                            <p>Beneficiaries</p>
                        </div>
                    </div>
                    <p className="description-text">
                        Our platform helps organizations and individuals track how donation
                        funds are collected, distributed, and used — all recorded transparently
                        on the blockchain. Eliminate ambiguity, ensure accountability, and build
                        trust in every transaction.
                    </p>
                </div>
                <div className="how-we-work">
                    <h2>How we work</h2>
                    <div className="how-steps">
                        <div>
                            <h1>1</h1>
                            <h3>Create a Budget Plan</h3>
                            <p>The organization adds a new budget plan for a project or activity. Then, set the total amount, description, and time period.</p>
                        </div>
                        <div>
                            <h1>2</h1>
                            <h3>Add Team Members</h3>
                            <p>The budget owner can invite team members (e.g., project leaders, department heads) to join the plan. These members can request funds when needed.</p>
                        </div>
                        <div>
                            <h1>3</h1>
                            <h3>Request Fund Usage</h3>
                            <p>A team member creates a fund request with details: what the money is for, how much is needed, and supporting documents (invoice, receipts, etc.).</p>
                        </div>
                        <div>
                            <h1>4</h1>
                            <h3>Approval by Budget Owner</h3>
                            <p>The budget owner reviews each request. They can approve or reject it with comments.</p>
                        </div>
                    </div>
                </div>
                <div className="testimonials">
                    <div className="testimonial-left">
                        <h2>What People Say</h2>
                        <p className="testimonial-intro">Discover what our satisfied customers have to say about their experiences with our service.</p>
                        <button className="try-now-btn">Try Now</button>
                    </div>

                    <div className="testimonial-right">

                        <div className="testimonial-cards">
                            <div className="testimonial-card">
                                <p>"This platform has restored my confidence in charitable giving. I can see exactly how my donations are used."</p>
                                <span>— Aisyah M., Donor</span>
                            </div>
                            <div className="testimonial-card">
                                <p>"Our university fundraising events are now more credible. Transparency has boosted both trust and engagement."</p>
                                <span>— Reza T., Student Organization Treasurer</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <nav>
                    <a href="#about">About Us</a>
                    <a href="#contact">Contact</a>
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#social">Social Media</a>
                </nav>
            </footer>
        </div>
    );
};

export default Landing;
