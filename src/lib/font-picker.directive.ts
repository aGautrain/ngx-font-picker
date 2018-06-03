import { Directive, OnInit, OnChanges, Input, Output, EventEmitter,
  HostListener, ApplicationRef, ElementRef, ViewContainerRef, SimpleChanges,
  ComponentFactoryResolver, Injector, ReflectiveInjector } from '@angular/core';

import { FontInterface } from './font-picker.interfaces';

import { FontPickerService } from './font-picker.service';

import { FontPickerComponent } from './font-picker.component';

@Directive({
  selector: '[fontPicker]',
  exportAs: 'ngxFontPicker'
})
export class FontPickerDirective implements OnInit, OnChanges {
  private dialog: any;

  @Input('fontPicker') fontPicker: FontInterface;

  @Input('fpWidth') fpWidth: string = '280px';
  @Input('fpHeight') fpHeight: string = '320px';

  @Input('fpFallbackFont') fpFallbackFont: FontInterface = {
    family: 'Roboto',
    size: '16px',
    style: 'regular',
    styles: ['regular']
  };

  @Input('fpAutoLoad') fpAutoLoad: boolean = true;

  @Input('fpPresetLabel') fpPresetLabel: string = '';
  @Input('fpPresetFonts') fpPresetFonts: string[] = [];

  @Input('fpSizeSelect') fpSizeSelect: boolean = true;
  @Input('fpStyleSelect') fpStyleSelect: boolean = true;

  @Input('fpDialogDisplay') fpDialogDisplay: string = 'popup';

  @Input('fpUseRootViewContainer') fpUseRootViewContainer: boolean = false;

  @Input('fpPosition') fpPosition: string = 'bottom';
  @Input('fpPositionOffset') fpPositionOffset: string = '0%';
  @Input('fpPositionRelativeToArrow') fpPositionRelativeToArrow: boolean = false;

  @Input('fpCancelButton') fpCancelButton: boolean = false;
  @Input('fpCancelButtonText') fpCancelButtonText: string = 'Cancel';
  @Input('fpCancelButtonClass') fpCancelButtonClass: string = 'fp-cancel-button-class';

  @Input('fpUploadButton') fpUploadButton: boolean = false;
  @Input('fpUploadButtonText') fpUploadButtonText: string = 'Upload';
  @Input('fpUploadButtonClass') fpUploadButtonClass: string = 'fp-upload-button-class';

  @Output('fontPickerUpload') fontPickerUpload = new EventEmitter<void>();
  @Output('fontPickerChange') fontPickerChange = new EventEmitter<FontInterface>();

  @HostListener('click', ['$event']) onClick(event: Event) {
    this.toggleDialog();
  }

  constructor(private injector: Injector, private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef, private vcRef: ViewContainerRef, private elRef: ElementRef,
    private service: FontPickerService) {}

  ngOnInit(): void {
    this.fontPicker = this.fontPicker || this.fpFallbackFont;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.fontPicker) {
      this.fontPicker = this.fontPicker || this.fpFallbackFont;

      if (this.fpAutoLoad) {
        this.loadFont(this.fontPicker);
      }
    }
  }

  public loadFont(font: FontInterface): void {
    this.service.loadFont(font);
  }

  public uploadFont(): void {
    this.fontPickerUpload.emit();
  }

  public openDialog(): void {
    if (!this.dialog || !this.dialog.open) {
      this.toggleDialog();
    }
  }

  public closeDialog(): void {
    if (this.dialog && this.dialog.open) {
      this.toggleDialog();
    }
  }

  public toggleDialog(): void {
    if (!this.dialog) {
      let vcRef = this.vcRef;

      if (this.fpUseRootViewContainer && this.fpDialogDisplay !== 'inline') {
        const classOfRootComponent = this.appRef.componentTypes[0];
        const appInstance = this.injector.get(classOfRootComponent);

        vcRef = appInstance.vcRef || appInstance.viewContainerRef || this.vcRef;

        if (vcRef === this.vcRef) {
          console.warn('You are using fpUseRootViewContainer, ' +
            'but the root component is not exposing viewContainerRef!' +
            'Please expose it by adding \'public vcRef: ViewContainerRef\' to the constructor.');
        }
      }

      const compFactory = this.resolver.resolveComponentFactory(FontPickerComponent);
      const injector = ReflectiveInjector.fromResolvedProviders([], vcRef.parentInjector);

      this.dialog = vcRef.createComponent(compFactory, 0, injector, []).instance;

      this.dialog.setDialog(this, this.elRef, this.fontPicker, this.fpUseRootViewContainer,
        this.fpPosition, this.fpPositionOffset, this.fpPositionRelativeToArrow, this.fpPresetLabel,
        this.fpPresetFonts, this.fpUploadButton, this.fpUploadButtonClass, this.fpUploadButtonText,
        this.fpStyleSelect, this.fpSizeSelect, this.fpCancelButton, this.fpCancelButtonClass,
        this.fpCancelButtonText, this.fpDialogDisplay, this.fpHeight, this.fpWidth);
    } else if (!this.dialog.open) {
      this.dialog.updateDialog(this.fontPicker, this.fpPosition, this.fpPositionOffset,
        this.fpPositionRelativeToArrow, this.fpPresetLabel, this.fpPresetFonts, this.fpUploadButton,
        this.fpUploadButtonClass, this.fpUploadButtonText, this.fpStyleSelect, this.fpSizeSelect,
        this.fpCancelButton, this.fpCancelButtonClass, this.fpCancelButtonText,
        this.fpDialogDisplay, this.fpHeight, this.fpWidth);

      this.dialog.openFontPicker();
    } else {
      this.dialog.closeFontPicker();
    }
  }

  public fontChanged(font: FontInterface): void {
    this.fontPickerChange.emit(font);
  }
}
