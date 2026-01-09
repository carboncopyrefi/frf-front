import Markdown from "react-markdown";
import { H1 } from "~/components/H1";
import { Back } from "~/components/Back";


export default function About() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Back />
            <H1>About the Funding Readiness Framework</H1>
            <div className="prose prose-indigo mt-6">
                <Markdown>
                    The Funding Readiness Framework is an open-source project developed by CARBON Copy to help Web3 ecosystems and grant round operators understand which projects are ready for growth-level funding.
                </Markdown>
                <Markdown>
                    On one side, projects submit information according to our standardised criteria. On the other, evaluators, such as grant round operators and other ecosystem leaders, pass judgement on the project's submission. The resulting score, quoted as a percentage, indicates the project's readiness for funding.
                </Markdown>
                <Markdown>
                    All submissions and evaluations generate an attestation through the Ethereum Attestation Service.
                </Markdown>
            </div>
        </div>
    );
}