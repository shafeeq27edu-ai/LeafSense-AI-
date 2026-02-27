export default function Hero() {
    return (
        <div className="relative overflow-hidden py-12 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
                    Intelligent Crop <br className="hidden sm:block" />
                    <span className="text-[var(--color-primary)]">Disease Detection</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)]">
                    Upload an image of your plant leaf, and our advanced AI will instantly identify diseases, provide confidence levels, and generate a tailored 7-day action plan.
                </p>
            </div>
        </div>
    );
}
