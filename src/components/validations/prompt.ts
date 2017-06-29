import { stateMachineInterfaces, unifierInterfaces, servicesInterfaces } from "assistant-source";
import { HookContext, Prompt as PromptInterface } from "./interfaces";

export class Prompt implements PromptInterface {
  private machine: stateMachineInterfaces.Transitionable;
  private session: servicesInterfaces.Session;
  private intent: string;
  private stateName: string;

  constructor(machine: stateMachineInterfaces.Transitionable, session: servicesInterfaces.Session, intent: string, stateName: string) {
    this.machine = machine;
    this.session = session;

    this.intent = intent;
    this.stateName = stateName;
  }

  prompt(entity: string) {
    return this.saveToContext(entity).then(() => {
      return this.switchStateForRetrieval();
    });
  }

  /** Switches state to prompt state, to retrieve new parameter. */
  switchStateForRetrieval() {
    if (!this.machine.stateExists("PromptState")) throw new Error("Tried to transition to generic 'PromptState', but was not registered. "+
      "Did you register the PromptState out of assistant-validations in your index.ts?");
    this.machine.redirectTo("PromptState", unifierInterfaces.GenericIntent.Invoke);
  }

  /** Saves information about new retrieval request into context object
   * Stores current state, current intent and the given entity name
   * @param entity The needed entity to retrieve
   * @return promise, after storing all to session
   */
  saveToContext(entity: string): Promise<void> {
    let context: HookContext =  {
      intent: this.intent,
      state: this.stateName,
      neededEntity: entity
    };

    return this.session.set("entities:currentPrompt", JSON.stringify(context));
  }
}