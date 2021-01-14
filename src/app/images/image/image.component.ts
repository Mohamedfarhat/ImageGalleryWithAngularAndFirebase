import { ImageService } from './../../shared/image.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styles: [
  ]
})
export class ImageComponent implements OnInit {

  imgSrc: string = '/assets/img/image-placeholder.jpg';
  selectedImage: any = null;
  isSubmitted: boolean;
  formTemplate = new FormGroup({
    caption: new FormControl('', Validators.required),
    category: new FormControl(''),
    imageUrl: new FormControl('', Validators.required)

  });


  constructor(private storage: AngularFireStorage , private service:ImageService) { }

  ngOnInit(): void {
    this.resetForm();
  }
  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
    } else {
      this.imgSrc = '/assets/img/image-placeholder.jpg';
      this.selectedImage = null;
    }
  }

  onSubmit(formValue) {
    this.isSubmitted = true;
    if (this.formTemplate.valid) {
      var filePath = `${formValue.category}/${this.selectedImage.name.split('.').slice(0,-1).join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            formValue['imageUrl'] = url;
            this.service.insertImageDetails(formValue);
            this.resetForm();
          })
        })
      ).subscribe();
    }
  }

  get formCpntrols() {
    return this.formTemplate['controls'];
  }

  resetForm() {
    this.formTemplate.reset();
    this.formTemplate.setValue({
      caption: '',
      imageUrl: '',
      category: 'Animal'
    });
    this.imgSrc = '/assets/img/image-placeholder.jpg';
    this.selectedImage = null;
    this.isSubmitted = false;
  }

}
