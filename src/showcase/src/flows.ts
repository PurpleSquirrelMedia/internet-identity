import { authenticateBoxFlow } from "$src/components/authenticateBox";
import { toast } from "$src/components/toast";
import { registerFlow } from "$src/flows/register";
import { badChallenge, promptCaptchaPage } from "$src/flows/register/captcha";
import { TemplateResult, html, render } from "lit-html";
import { dummyChallenge, i18n, manageTemplates } from "./showcase";

export const flowsPage = () => {
  document.title = "Flows";
  const container = document.getElementById("pageContent") as HTMLElement;
  render(pageContent, container);
};

export const iiFlows: Record<string, () => void> = {
  loginManage: async () => {
    const result = await authenticateBoxFlow<null>({
      i18n,
      templates: manageTemplates,
      addDevice: () => {
        toast.info(html`Added device`);
        return Promise.resolve({ alias: "My Device" });
      },
      login: () => {
        toast.info(html`Logged in`);
        return Promise.resolve({
          tag: "ok",
          userNumber: BigInt(1234),
          connection: null,
        });
      },
      register: () => {
        toast.info(html`Registered`);
        return Promise.resolve({
          tag: "ok",
          userNumber: BigInt(1234),
          connection: null,
        });
      },
      recover: () => {
        toast.info(html`Recovered`);
        return Promise.resolve({
          tag: "ok",
          userNumber: BigInt(1234),
          connection: null,
        });
      },
    });
    toast.success(html`
      Authentication complete!<br />
      <p class="l-stack">
        <strong class="t-strong">${prettyResult(result)}</strong>
      </p>
      <button
        class="l-stack c-button c-button--secondary"
        @click=${() => window.location.reload()}
      >
        reload
      </button>
    `);
  },
  captcha: () => {
    promptCaptchaPage({
      cancel: () => console.log("canceled"),
      requestChallenge: () =>
        new Promise((resolve) => setTimeout(resolve, 1000)).then(
          () => dummyChallenge
        ),
      verifyChallengeChars: (cr) =>
        new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
          cr.chars === "8wJ6Q" ? "yes" : badChallenge
        ),
      onContinue: () => console.log("Done"),
      i18n,
      focus: false,
    });
  },

  register: async () => {
    const result = await registerFlow<null>({
      createChallenge: async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return dummyChallenge;
      },
      register: async ({ challengeResult: { chars } }) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (chars !== "8wJ6Q") {
          return { kind: "badChallenge" };
        }
        return {
          kind: "loginSuccess",
          userNumber: BigInt(12356),
          connection: null,
        };
      },
    });

    toast.success(html`
      Identity successfully created!<br />
      <p class="l-stack">
        <strong class="t-strong">${prettyResult(result)}</strong>
      </p>
      <button
        class="l-stack c-button c-button--secondary"
        @click=${() => window.location.reload()}
      >
        reload
      </button>
    `);
  },
};

const pageContent: TemplateResult = html`
  <div class="l-wrap">
    <div class="l-container">
      <div class="c-card c-card--background">
        <h1 class="t-title t-title--main">Flows</h1>
        <div class="l-stack">
          ${Object.entries(iiFlows).map(([flowName, _]) => {
            // '/' or '/internet-identity/'
            const baseUrl = import.meta.env.BASE_URL ?? "/";
            // '/myFlow' or '/internet-identity/myFlow'
            const flowLink = baseUrl + "flows/" + flowName;
            return html`<aside>
              <a data-page-name=${flowName} href=${flowLink}>
                <h2>${flowName}</h2>
              </a>
            </aside>`;
          })}
        </div>
      </div>
    </div>
  </div>
`;

const prettyResult = (obj: unknown) => {
  if (typeof obj === "string") {
    return obj;
  }

  if (typeof obj === "object" && obj !== null) {
    return html`<ul>
      ${Object.entries(obj).map(
        ([k, v]) => html`<li><strong class="t-strong">${k}: ${v}</strong></li>`
      )}
    </ul>`;
  }

  return JSON.stringify(obj);
};