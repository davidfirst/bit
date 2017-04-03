/** @flow */
import BitObject from './objects/object';
import Repository from './objects/repository';

export default class ComponentObjects {
  component: Buffer;
  objects: Buffer[];

  constructor(component: Buffer, objects: Buffer[]) {
    this.component = component;
    this.objects = objects;
  }

  // @TODO opitimize ASAP.
  toString(): string {
    return JSON.stringify({
      component: this.component,
      objects: this.objects
    });
  }

  // @TODO opitimize ASAP.
  static fromString(str: string): ComponentObjects {
    return ComponentObjects.fromObject(JSON.parse(str));
  }

  static fromObject(object: Object): ComponentObjects {
    const { component, objects } = object;

    return new ComponentObjects(
      new Buffer(component),
      objects.map(obj => new Buffer(obj))
    );
  }

  toObjects(repo: Repository): { component: BitObject, objects: BitObject[] } {
    return {
      component: BitObject.parseSync(this.component, repo.types),
      objects: this.objects.map(obj => BitObject.parseSync(obj, repo.types))
    };
  }
}
