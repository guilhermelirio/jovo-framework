import _cloneDeep from 'lodash.clonedeep';
import { inspect } from 'util';
import { BaseComponent, ComponentConstructor } from '../BaseComponent';
import { BaseOutput, OutputConstructor } from '../BaseOutput';
import { ComponentMetadata } from './ComponentMetadata';
import { HandlerMetadata } from './HandlerMetadata';
import { HandlerOptionMetadata } from './HandlerOptionMetadata';
import { OutputMetadata } from './OutputMetadata';

// TODO: implement
export class MetadataStorage {
  private static instance: MetadataStorage;
  // TODO: determine whether any is required/helpful here
  readonly componentMetadata: ComponentMetadata[];
  readonly handlerMetadata: HandlerMetadata[];
  readonly handlerOptionMetadata: HandlerOptionMetadata[];
  readonly outputMetadata: OutputMetadata[];

  private constructor() {
    this.componentMetadata = [];
    this.handlerMetadata = [];
    this.handlerOptionMetadata = [];
    this.outputMetadata = [];
  }

  static getInstance(): MetadataStorage {
    if (!MetadataStorage.instance) {
      MetadataStorage.instance = new MetadataStorage();
    }
    return MetadataStorage.instance;
  }

  addComponentMetadata<COMPONENT extends BaseComponent>(metadata: ComponentMetadata<COMPONENT>) {
    // TODO: determine what to do if a component like that already exists
    // for now, just skip (first only counts)
    if (this.getComponentMetadata(metadata.target)) {
      return;
    }
    this.componentMetadata.push(metadata);
  }

  getComponentMetadata<COMPONENT extends BaseComponent>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: ComponentConstructor<COMPONENT> | Function,
  ): ComponentMetadata<COMPONENT> | undefined {
    return this.componentMetadata.find((metadata) => metadata.target === target) as
      | ComponentMetadata<COMPONENT>
      | undefined;
  }

  addOutputMetadata<OUTPUT extends BaseOutput>(target: OutputConstructor<OUTPUT>, name: string) {
    const existingMetadata = this.getOutputMetadataByName(name);

    if (existingMetadata) {
      // make sure the name of an Output is unique
      const similarExistingMetadata = this.outputMetadata.filter((metadata) =>
        metadata.name.startsWith(name),
      );
      const getEndingNumberRegex = /(\d+)$/;
      let highestNumber = -1;
      similarExistingMetadata.forEach((metadata) => {
        const endingNumberMatch = getEndingNumberRegex.exec(metadata.name);
        const endingNumber = +(endingNumberMatch?.[1] || -1);
        if (endingNumber > highestNumber) {
          highestNumber = endingNumber;
        }
      });
      highestNumber++;

      if (getEndingNumberRegex.test(name)) {
        name = name.replace(getEndingNumberRegex, highestNumber.toString());
      } else {
        name += highestNumber;
      }
    }

    this.outputMetadata.push(new OutputMetadata(target, name));
  }

  getOutputMetadata<OUTPUT extends BaseOutput>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: OutputConstructor<OUTPUT> | Function,
  ): OutputMetadata<OUTPUT> | undefined {
    return this.outputMetadata.find((metadata) => metadata.target === target);
  }

  getOutputMetadataByName<OUTPUT extends BaseOutput>(
    name: string,
  ): OutputMetadata<OUTPUT> | undefined {
    return this.outputMetadata.find((metadata) => metadata.name === name);
  }

  addHandlerMetadata<COMPONENT extends BaseComponent, KEY extends keyof COMPONENT>(
    metadata: HandlerMetadata<COMPONENT, KEY>,
  ) {
    this.handlerMetadata.push(metadata as HandlerMetadata);
  }

  getHandlerMetadataOfComponent<COMPONENT extends BaseComponent>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: ComponentConstructor<COMPONENT> | Function,
  ): HandlerMetadata<COMPONENT, keyof COMPONENT>[] {
    return this.handlerMetadata.filter((metadata) => metadata.target === target);
  }

  getMergedHandlerMetadataOfComponent<COMPONENT extends BaseComponent>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: ComponentConstructor<COMPONENT> | Function,
  ): HandlerMetadata<COMPONENT, keyof COMPONENT>[] {
    const componentHandlerMetadata = this.getHandlerMetadataOfComponent(target);
    const mergedMetadata = componentHandlerMetadata.map((handlerMetadata) => {
      const mergedHandlerMetadata = _cloneDeep(handlerMetadata);
      const relatedHandlerOptionMetadata = this.handlerOptionMetadata.filter((optionMetadata) =>
        optionMetadata.hasSameTargetAs(mergedHandlerMetadata),
      );
      relatedHandlerOptionMetadata.forEach((optionMetadata) =>
        mergedHandlerMetadata.mergeWith(optionMetadata),
      );
      return mergedHandlerMetadata;
    });

    const handlerOptionMetadataWithoutHandler = this.handlerOptionMetadata.filter(
      (optionMetadata) =>
        optionMetadata.target === target &&
        !componentHandlerMetadata.some((handlerMetadata) =>
          handlerMetadata.hasSameTargetAs(optionMetadata),
        ),
    );
    handlerOptionMetadataWithoutHandler.forEach((optionMetadata) => {
      const relatedHandlerMetadata = mergedMetadata.find((handlerMetadata) =>
        handlerMetadata.hasSameTargetAs(optionMetadata),
      );
      if (!relatedHandlerMetadata) {
        mergedMetadata.push(
          new HandlerMetadata<COMPONENT, keyof COMPONENT>(
            optionMetadata.target,
            optionMetadata.propertyKey,
            { ...optionMetadata.options },
          ),
        );
      } else {
        relatedHandlerMetadata.mergeWith(optionMetadata);
      }
    });
    return mergedMetadata;
  }

  addHandlerOptionMetadata<COMPONENT extends BaseComponent, KEY extends keyof COMPONENT>(
    metadata: HandlerOptionMetadata<COMPONENT, KEY>,
  ) {
    this.handlerOptionMetadata.push(metadata as HandlerOptionMetadata);
  }

  getHandlerOptionMetadataOfComponent<COMPONENT extends BaseComponent>(
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: ComponentConstructor<COMPONENT> | Function,
  ): HandlerOptionMetadata<COMPONENT, keyof COMPONENT>[] {
    return this.handlerOptionMetadata.filter((metadata) => metadata.target === target);
  }

  clearAll(): void {
    this.componentMetadata.length = 0;
    this.handlerMetadata.length = 0;
    this.handlerOptionMetadata.length = 0;
    this.outputMetadata.length = 0;
  }
}