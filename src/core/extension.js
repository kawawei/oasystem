// 擴展基類
export class Extension {
  constructor(manifest) {
    this.id = manifest.id
    this.name = manifest.name
    this.version = manifest.version
    this.permissions = manifest.permissions
  }

  // 生命週期方法
  onInstall() {}
  onActivate() {}
  onDeactivate() {}
} 