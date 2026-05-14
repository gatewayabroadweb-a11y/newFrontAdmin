import React from 'react';
import PageServices from '../../services/PageServices';
import { useParams, useNavigate } from 'react-router-dom';
import { RHFTextField, FormProvider, RHFSelectbox, RHFUpdateImage } from '../../hook-form';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { constant } from '../../constant/index.constant';
import { toasterService } from '../../custom/toasterService';
import { Editor } from '@tinymce/tinymce-react';

function AddBlog() {
  const navigate = useNavigate();
  let { bId: id } = useParams();

  React.useEffect(() => {
    if (id) {
      getBlogData();
    }
  }, [id]);

  const BlogSchema = Yup.object().shape({
    blogTitle: Yup.string().required('required'),
    blogDescription: Yup.string().required('required'),
    category: Yup.string().required('required'),
    createdBy: Yup.string(),
    Status: Yup.boolean(),
    file: Yup.mixed().required('File is Required'),
    Slug: Yup.string().required('required'),
    descriptions: Yup.string().required('required'),
    keyword: Yup.string().required('required')
  });

  const defaultValues = {
    blogTitle: "",
    blogDescription: "",
    category: "",
    createdBy: "",
    file: null,
    Status: false,
    Slug: "",
    descriptions: "",
    keyword: "",
  };

  const methods = useForm({
    resolver: yupResolver(BlogSchema),
    defaultValues,
    mode: "all"
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isDirty, isValid },
  } = methods;

  const getBlogData = async () => {
    try {
      const response = await PageServices.getBlogDataByIdForEdit(id);
      if (response.status === 'success') {
        reset(response.data.blog);
        setValue('file', { name: response.data.blog.image });
        setValue('Slug', response.data.blog.Slug ? response.data.blog.Slug : response.data.blog.blogTitle?.replaceAll(' ', '_'));
      } else {
        console.log('something went wrong');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUpdate = async (formData) => {
    if (id) {
      try {
        const updatedData = await PageServices.updateBlogDataById(id, formData);
        if (updatedData.status === 'success') {
          toasterService(updatedData.data.message, 2, 453453453);
          navigate(`/admin/blog`);
        } else {
          toasterService('Something went wrong', 4);
        }
      } catch (error) {
        console.error('Error updating data:', error);
      }
    } else {
      try {
        const createJob = await PageServices.createBlog(formData);
        if (createJob.status === 'success') {
          toasterService(createJob.data.message, 2, 453453453);
          navigate(`/admin/blog`);
        } else {
          toasterService('Something went wrong', 4);
        }
      } catch (error) {
        console.error('Error creating blog:', error);
      }
    }
  };

  const onSubmit = async (_data) => {
    const formData = new FormData();
    if (_data && !!watch('blogDescription')?.length && watch('category')) {
      formData.append('blogTitle', _data.blogTitle);
      formData.append('blogDescription', _data.blogDescription);
      formData.append('createdBy', _data.createdBy);
      formData.append('category', _data.category);
      formData.append('Slug', _data.Slug);
      formData.append('Status', _data.Status);
      formData.append('descriptions', _data.descriptions);
      formData.append('keyword', _data.keyword);
      if (_data.file && typeof _data.file === 'object') formData.append('file', _data.file);
      handleUpdate(formData);
    }
  };

  // ✅ TinyMCE Configuration with all features and blob image handling
  const editorConfig = {
    height: 500,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample',
      'emoticons', 'quickbars', 'pagebreak', 'nonbreaking', 'save'
    ],
    toolbar: [
      'undo redo | blocks | bold italic underline strikethrough | forecolor backcolor |',
      'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |',
      'link image media table codesample | pagebreak nonbreaking |',
      'removeformat | preview print | code fullscreen | help'
    ].join(' '),
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: 'oxide',
    content_css: 'default',
    promotion: false,
    branding: false,
    
    // ✅ File Picker for Images (converts to blob)
    file_picker_callback: (callback, value, meta) => {
      if (meta.filetype === 'image') {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        
        input.onchange = () => {
          const file = input.files[0];
          
          // Read the file as a data URL (base64)
          const reader = new FileReader();
          reader.onload = () => {
            // The result is a base64 data URI
            callback(reader.result, { alt: file.name });
          };
          reader.readAsDataURL(file);
        };
        
        input.click();
      }
    },
  };

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>{id ? "Update" : "Add"} Blog</h1>
            </div>
          </div>
        </div>
      </section>
      
      <section className="content">
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} role="form">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{id ? "Update" : "Add"} Blog</h3>
            </div>
            
            <div className="card-body">
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <RHFTextField name="blogTitle" label="Title" required />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <RHFTextField name="Slug" label="Slug" required />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <RHFSelectbox 
                      required 
                      name='category' 
                      label="Select Course" 
                      menus={constant.COURSE_MENU.filter((x) => x.name !== "All")} 
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="custom-file">
                    <RHFUpdateImage name="file" label="Image" />
                  </div>
                </div>
              </div>

              {/* ✅ Full-Featured TinyMCE Editor with Blob Images */}
              <div className="row">
                <div className="col-sm-12">
                  <div className="form-group">
                    <label>Description</label>
                    <Editor
                      // apiKey={'cvv7pvo9jpr74j9bcg5j7mt8d0esguhdhw4dc5uoxky2pxdn'}
                      apiKey={'l4qgr6sy1p9dh0avnwki17s0jwa8a3t76imusey6nab2t0jn'}
                      value={watch('blogDescription') || ''}
                      onEditorChange={(content) => setValue('blogDescription', content, { shouldDirty: true })}
                      init={editorConfig}
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className='col-6'>
                  <RHFTextField name="keyword" label="Keyword" required />
                  <span className='small'>
                    Use comma separate for multiple keywords. 
                    <span className='text-muted'> Ex. news,blog</span>
                  </span>
                </div>
                <div className='col-6'>
                  <RHFTextField name="descriptions" label="Descriptions" required />
                </div>
              </div>
            </div>

            <div className="card-footer d-flex gap-2">
              <button 
                type="button" 
                onClick={() => navigate('/admin/blog')} 
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button 
                disabled={!isDirty || !isValid} 
                type="submit" 
                className="btn btn-primary"
              >
                Submit
              </button>
            </div>
          </div>
        </FormProvider>
      </section>
    </div>
  );
}

export default AddBlog;