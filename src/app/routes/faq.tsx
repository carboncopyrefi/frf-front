import Markdown from "react-markdown";
import { H1 } from "~/components/H1";
import { Back } from "~/components/Back";

const url = "https://frf.carboncopy.news/faq";

export function links() {
  return [{
    rel: "canonical",
    href: url
  }];
};

export default function Faq() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Back />
            <H1>Frequently Asked Questions</H1>
            <div className="prose dark:prose-invert mt-6">
                <Markdown>
                    ### Who is the Funding Readiness Framework best suited for?
                </Markdown>
                <Markdown>
                    The current set of questions is targeted at projects looking to go from early stage to growth stage. In other words, projects who are looking for US$50,000 or more in funding to take the next step.
                </Markdown>
                <Markdown>
                    ### Who are the evaluators?
                </Markdown>
                <Markdown>
                    We've included a number of ReFi ecosystem leaders, researchers, grant operators, and funders in our evaluator list. Currently, a wallet address is all that identifies them, but we are discussing the best solution for verifying the credibility of the evaluators. 
                </Markdown>
                <Markdown>
                    ### What is the evaluation logic?
                </Markdown>
                <Markdown>
                    The way it works is that evaluators are asked whether they agree, disagree, or are neutral towards a project's answers. For example, the project provides details about the problem it's solving. The evaluator is prompted with "The project identifies a legitimate problem" and Agree, Disagree, and Neutral buttons.
                </Markdown>
                <Markdown>
                    ### I'm running into difficulties making a submission. What should I do?
                </Markdown>
                <Markdown>
                    If you're having any issues with the app, feel free to reach out at hello@carboncopy.news or join our Discord server and use the channel 'funding-readiness-framework'.
                </Markdown>
                <Markdown>
                    ### I've made a submission. How long will it take for it to be evaluated?
                </Markdown>
                <Markdown>
                    Hopefully not long! We actively reach out to evaluators when new submissions are made. 
                </Markdown>
                <Markdown>
                    ### How can I make updates to my submission?
                </Markdown>
                <Markdown>
                    We don't offer a way to directly edit a submission because that would affect the veracity of past evaluations. What is possible is making a new submission. This will take the place of your current submission (the one that appears when you share your custom project URL) and will need to be evaluated, but it will always be linked to your previous submission(s). This makes your evolution as a project visible to everyone.
                </Markdown>
                <Markdown>
                    ### Can the Framework be used for ecosystems other than ReFi?
                </Markdown>
                <Markdown>
                    Yes! Reach out to us at hello@carboncopy.news and we can work through the process of setting up a new ecosystem.
                </Markdown>
            </div>
        </div>
    );
}