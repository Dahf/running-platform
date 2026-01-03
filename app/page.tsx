import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity, TrendingUp, Map, Target, Award, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-orange-600" />
            <span className="text-2xl font-bold text-slate-900">Athlete</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-slate-700">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-orange-600 hover:bg-orange-700">Get started</Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Train smarter with <span className="text-orange-600">premium analytics</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            Advanced training insights, personalized route planning, and detailed performance tracking for serious
            athletes
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
                Start free trial
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Learn more
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Training Analysis</h3>
            <p className="text-slate-600 leading-relaxed">
              Performance comparisons, heart rate zones, fitness trends, and freshness indicators to optimize your
              training
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Map className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Personalized Route Planning</h3>
            <p className="text-slate-600 leading-relaxed">
              Create custom routes with heatmaps, elevation profiles, and community-driven route recommendations
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Segment Leaderboards</h3>
            <p className="text-slate-600 leading-relaxed">
              Compete on popular segments with filtered leaderboards and live segment tracking during activities
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Custom Training Plans</h3>
            <p className="text-slate-600 leading-relaxed">
              Structured workouts tailored to your goals with progress tracking and adaptive scheduling
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Goals & Milestones</h3>
            <p className="text-slate-600 leading-relaxed">
              Set distance, time, and activity goals with visual progress tracking and achievement celebrations
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Sport Support</h3>
            <p className="text-slate-600 leading-relaxed">
              Track running, cycling, swimming, and more with sport-specific metrics and analysis
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to elevate your training?</h2>
          <p className="text-xl mb-8 text-orange-50">Join thousands of athletes using Athlete to reach their goals</p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-50 text-lg px-8">
              Start your journey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
