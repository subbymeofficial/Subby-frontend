import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container-main py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center mb-3">
              <img src="/subbyme-logo-footer.png" alt="SubbyMe" className="h-14 sm:h-16 md:h-20 lg:h-24 object-contain w-auto max-w-[280px]" />
            </div>
            <p className="text-sm text-muted-foreground">Skilled Help, On Demand.</p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/contractors" className="hover:text-primary transition-colors">Find Contractors</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link to="/register" className="hover:text-primary transition-colors">Sign Up</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">For Contractors</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/register" className="hover:text-primary transition-colors">Join as Contractor</Link>
              <span>Pricing</span>
              <span>Support</span>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-foreground">Legal &amp; Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <span>hello@subbyme.com</span>
              <span>1300 SUB BYM</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          Â© {new Date().getFullYear()} SubbyMe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
